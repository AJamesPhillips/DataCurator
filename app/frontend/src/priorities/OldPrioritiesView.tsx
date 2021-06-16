import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { Canvas } from "../canvas/Canvas"
import { project_priority_y } from "../canvas/display"
import type { ContentCoordinate } from "../canvas/interfaces"
import { MainArea } from "../layout/MainArea"
import type { RootState } from "../state/State"
import { CurrentDatetimeLine } from "./CurrentDatetimeLine"
import { DailyActionNode } from "./daily_actions/DailyActionNode"
import { convert_daily_actions_to_nodes } from "./daily_actions/daily_actions_to_nodes"
import { get_daily_actions_meta_c } from "./daily_actions/get_daily_actions"
import { ProjectPriorityNode } from "./project_priorities/ProjectPriorityNode"
import { convert_project_priorities_to_nodes } from "./project_priorities/project_priorities_to_nodes"



const map_state = (state: RootState) => {
    const display_at_datetime_ms = state.routing.args.created_at_ms

    const daily_actions_meta = get_daily_actions_meta_c(state)

    return {
        display_at_datetime_ms,
        project_priorities_meta: state.derived.project_priorities_meta,
        daily_actions_meta,
    }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>



const get_svg_children = (props: Props) =>
{
    const { priorities_by_project } = get_nodes_from_props(props)
    const project_count = Object.keys(priorities_by_project).length
    const max_y = project_priority_y(project_count)

    return [<CurrentDatetimeLine max_y={max_y} display_last_n_months={5} />]
}



const get_children = (props: Props) =>
{
    const {
        project_priority_nodes,
        daily_action_nodes,
    } = get_nodes_from_props(props)

    const elements = [
        ...project_priority_nodes.map(node_props => <ProjectPriorityNode {...node_props} />),
        ...daily_action_nodes.map(node_props => <DailyActionNode
            {...node_props}
        />),
    ]

    const content_coordinates: ContentCoordinate[] = []
    const first_project_priority_nodes = project_priority_nodes.first()
    if (first_project_priority_nodes)
    {
        const { x: left, y: top } = first_project_priority_nodes
        content_coordinates.push({ left, top, zoom: 100 })
    }

    return { elements, content_coordinates }
}



function get_nodes_from_props (props: Props)
{
    const {
        project_priorities_meta,
        display_at_datetime_ms,
        daily_actions_meta,
    } = props

    const { priorities_by_project, project_id_to_vertical_position } = project_priorities_meta

    const project_priority_nodes = convert_project_priorities_to_nodes({
        priorities_by_project,
        display_at_datetime_ms,
    })

    const daily_action_nodes = convert_daily_actions_to_nodes({
        daily_actions_meta,
        display_at_datetime_ms,
        project_id_to_vertical_position,
    })

    return {
        project_priority_nodes,
        daily_action_nodes,
        priorities_by_project,
    }
}



function _OldPrioritiesView (props: Props)
{
    const { elements, content_coordinates } = get_children(props)

    return <MainArea
        main_content={<Canvas
            svg_children={get_svg_children(props)}
            svg_upper_children={[]}
            content_coordinates={content_coordinates}
        >
            {elements}
        </Canvas>}
    />
}

export const OldPrioritiesView = connector(_OldPrioritiesView) as FunctionalComponent<{}>
