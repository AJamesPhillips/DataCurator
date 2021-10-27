import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { Canvas } from "../canvas/Canvas"
import { round_coordinate_small_step } from "../canvas/position_utils"
import { calculate_canvas_x_for_datetime, calculate_canvas_x_for_wcomponent_temporal_uncertainty, default_time_origin_parameters } from "../knowledge_view/datetime_line"
import { KnowledgeGraphTimeMarkers } from "../knowledge_view/KnowledgeGraphTimeMarkers"
import { MainArea } from "../layout/MainArea"
import { get_uncertain_datetime } from "../shared/uncertainty/datetime"
import { sort_list } from "../shared/utils/sort"
import { get_created_at_ms } from "../shared/utils_datetime/utils_datetime"
import { get_current_composed_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import type { WComponentPrioritisation } from "../wcomponent/interfaces/priorities"
import { DailyActionNode } from "./DailyActionNode"
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
    }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>



const get_svg_children = (props: Props) =>
{
    return []
}



const get_children = (props: Props) =>
{
    let { prioritisations = [] } = props
    prioritisations = sort_list(prioritisations, p => get_created_at_ms(p), "ascending")
        .filter(p => !!get_uncertain_datetime(p.datetime))

    let offset = 0
    const goal_or_action_id_to_offset: {[goal_or_action_id: string]: number} = {}
    const prioritised_goal_or_action_data: {
        prioritisation_id: string, goal_or_action_id: string, effort: number
    }[] = []
    const prioritisation_data_by_id: {[prioritisation_id: string]: {
        total_effort: number, start_date: Date, end_date: Date
    }} = {}

    prioritisations.forEach((prioritisation, prioritisation_index) =>
    {
        const start_date = get_uncertain_datetime(prioritisation.datetime)
        if (!start_date) return // type guard, previous filter should ensure it has datetime with a value

        let total_effort = 0
        Object.entries(prioritisation.goals).forEach(([goal_or_action_id, prioritisation_entry]) =>
        {
            total_effort += prioritisation_entry.effort

            prioritised_goal_or_action_data.push({
                prioritisation_id: prioritisation.id,
                goal_or_action_id,
                effort: prioritisation_entry.effort,
            })

            if (goal_or_action_id_to_offset[goal_or_action_id] !== undefined) return
            goal_or_action_id_to_offset[goal_or_action_id] = offset++
        })


        const next_prioritisation = prioritisations[prioritisation_index + 1]
        const end_date = get_uncertain_datetime(next_prioritisation?.datetime) || new Date()

        prioritisation_data_by_id[prioritisation.id] = {
            total_effort,
            start_date,
            end_date,
        }
    })


    const { time_origin_ms, time_origin_x, time_scale } = default_time_origin_parameters(props)

    const elements: h.JSX.Element[] = prioritised_goal_or_action_data.map(({ prioritisation_id, goal_or_action_id, effort }) =>
    {
        const offset = goal_or_action_id_to_offset[goal_or_action_id] || 0
        const { total_effort, start_date, end_date } = prioritisation_data_by_id[prioritisation_id]!

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
            y={100 * offset}
            width={x2 - x}
            height={100}
            display={true}
        />
    })

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
        >
            {elements}
        </Canvas>}
    />
}

export const PrioritiesView = connector(_PrioritiesView) as FunctionalComponent<{}>
