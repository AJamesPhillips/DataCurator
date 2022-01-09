import { FunctionalComponent, h } from "preact"
import { useMemo } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { Canvas } from "../canvas/Canvas"
import { round_coordinate_small_step } from "../canvas/position_utils"
import { calculate_canvas_x_for_datetime, default_time_origin_parameters } from "../knowledge_view/datetime_line"
import { KnowledgeGraphTimeMarkers } from "../knowledge_view/KnowledgeGraphTimeMarkers"
import { MainArea } from "../layout/MainArea"
import { get_uncertain_datetime } from "../shared/uncertainty/datetime"
import { sort_list } from "../shared/utils/sort"
import { get_current_composed_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import type { WComponentPrioritisation } from "../wcomponent/interfaces/priorities"
import { ProjectPriorityNode } from "./old_project_priorities/ProjectPriorityNode"



const map_state = (state: RootState) =>
{
    const kv = get_current_composed_knowledge_view_from_state(state)
    const prioritisations = kv?.prioritisations
    const composed_datetime_line_config = kv?.composed_datetime_line_config

    return {
        prioritisations,
        time_origin_ms: composed_datetime_line_config?.time_origin_ms,
        time_origin_x: composed_datetime_line_config?.time_origin_x,
        time_scale: composed_datetime_line_config?.time_scale,
        presenting: state.display_options.consumption_formatting,
    }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>



const get_svg_children = (props: Props) =>
{
    return []
}



interface HasStartDate
{
    start_date: Date
}
function has_start_date <U> (p: U & Partial<HasStartDate>): p is U & HasStartDate
{
    return !!p.start_date
}

interface DenormalisedPrioritisation extends WComponentPrioritisation {
    total_effort: number
    start_date: Date
    end_date: Date
}
interface PrioritisedGoalOrAction
{
    prioritisation_id: string
    goal_or_action_id: string
    effort: number
    offset_index: number
}


const get_children = (props: Props) =>
{
    const { prioritisations = [] } = props
    const { denormalised_prioritisation_by_id, prioritised_goals_and_actions } = useMemo(() =>
    {
        const date_now = new Date()
        let denormalised_prioritisations: DenormalisedPrioritisation[] = prioritisations
            .map(prioritisation => ({
                ...prioritisation,
                total_effort: 0,
                start_date: get_uncertain_datetime(prioritisation.datetime),
                end_date: date_now,
            }))
            .filter(has_start_date)

        denormalised_prioritisations = sort_list(denormalised_prioritisations, p => p.start_date.getTime(), "ascending")


        let offset = 0
        const goal_or_action_id_to_offset: {[goal_or_action_id: string]: number} = {}
        const prioritised_goals_and_actions: PrioritisedGoalOrAction[] = []

        denormalised_prioritisations.forEach((prioritisation, prioritisation_index) =>
        {
            Object.entries(prioritisation.goals).forEach(([goal_or_action_id, prioritisation_entry]) =>
            {
                prioritisation.total_effort += prioritisation_entry.effort

                let offset_index = goal_or_action_id_to_offset[goal_or_action_id]
                if (offset_index === undefined)
                {
                    offset_index = offset++
                    goal_or_action_id_to_offset[goal_or_action_id] = offset_index
                }

                prioritised_goals_and_actions.push({
                    prioritisation_id: prioritisation.id,
                    goal_or_action_id,
                    effort: prioritisation_entry.effort,
                    offset_index,
                })
            })


            const next_prioritisation = denormalised_prioritisations[prioritisation_index + 1]
            prioritisation.end_date = get_uncertain_datetime(next_prioritisation?.datetime) || date_now
        })


        const denormalised_prioritisation_by_id: {[id: string]: DenormalisedPrioritisation} = {}
        denormalised_prioritisations.forEach(p => denormalised_prioritisation_by_id[p.id] = p)


        return { denormalised_prioritisation_by_id, prioritised_goals_and_actions }
    }, [prioritisations])



    const { time_origin_ms, time_origin_x, time_scale } = default_time_origin_parameters(props)

    const elements: h.JSX.Element[] = useMemo(() => prioritised_goals_and_actions.map(({ prioritisation_id, goal_or_action_id, effort, offset_index }) =>
        {
            const { total_effort, start_date, end_date } = denormalised_prioritisation_by_id[prioritisation_id]!

            const x = round_coordinate_small_step(calculate_canvas_x_for_datetime({
                datetime: start_date, time_origin_ms, time_origin_x, time_scale,
            }))
            const x2 = round_coordinate_small_step(calculate_canvas_x_for_datetime({
                datetime: end_date, time_origin_ms, time_origin_x, time_scale,
            }))

            return <ProjectPriorityNode
                effort={effort / total_effort}
                wcomponent_id={goal_or_action_id}
                x={x}
                y={100 * offset_index}
                width={x2 - x}
                height={100}
                display={true}
            />
        })
    , [
        denormalised_prioritisation_by_id, prioritised_goals_and_actions,
        time_origin_ms, time_origin_x, time_scale,
    ])

    // elements.push(<DailyActionNode
    //     action_ids={[]} width={10} height={10} display={true} x={x1} y={0}
    // />)


    return elements
}



const get_overlay_children = () =>
{
    return <KnowledgeGraphTimeMarkers force_display={true} show_by_now={true} />
}



function _PrioritiesView (props: Props)
{
    const elements = get_children(props)

    return <MainArea
        main_content={<Canvas
            svg_children={get_svg_children(props)}
            svg_upper_children={[]}
            overlay={get_overlay_children()}
            plain_background={props.presenting}
        >
            {elements}
        </Canvas>}
    />
}

export const PrioritiesView = connector(_PrioritiesView) as FunctionalComponent<{}>
