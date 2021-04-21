import { h } from "preact"
import { project_priority_y } from "../canvas/display"

import type { CanvasPoint } from "../canvas/interfaces"
import { MainContentControls } from "../layout/MainContentControls"
import { ViewController } from "../layout/ViewController"
import { routing_args_to_datetime_ms } from "../state/routing/routing_datetime"
import type { RootState } from "../state/State"
import { factory_memoize_object } from "../utils/memoize"
import { CurrentDatetimeLine } from "./CurrentDatetimeLine"
import { DailyActionNode } from "./daily_actions/DailyActionNode"
import { DailyActionsList } from "./daily_actions/DailyActionsList"
import { convert_daily_actions_to_nodes } from "./daily_actions/daily_actions_to_nodes"
import { get_daily_actions_meta_c } from "./daily_actions/get_daily_actions"
import { get_project_priorities_meta_c } from "./project_priorities/get_project_priorities"
import { ProjectPriorityOrderArgs, group_priorities_by_project, order_priorities_by_project } from "./project_priorities/group_and_order"
import { ProjectPriorityNode } from "./project_priorities/ProjectPriorityNode"
import { convert_project_priorities_to_nodes } from "./project_priorities/project_priorities_to_nodes"
import { get_project_id_to_vertical_position } from "./project_priorities/vertical_position"



const memoize_order_args = factory_memoize_object<ProjectPriorityOrderArgs>()

const map_state = (state: RootState) => {
    const display_at_datetime_ms = routing_args_to_datetime_ms(state)

    const {
        earliest_ms,
        latest_ms,
        project_priorities,
    } = get_project_priorities_meta_c(state)
    const order_args: ProjectPriorityOrderArgs = memoize_order_args({ type: state.routing.args.order })
    const daily_actions_meta = get_daily_actions_meta_c(state)

    return {
        display_at_datetime_ms,
        earliest_ms,
        latest_ms,
        project_priorities,
        order_args,
        daily_actions_meta,
    }
}


type Props = ReturnType<typeof map_state>


function get_initial_state ()
{
    return {
        action_ids_to_show: [] as string[]
    }
}


type State = ReturnType<typeof get_initial_state>


const get_svg_children = (props: Props, state: State) =>
{
    const { priorities_by_project } = get_derived_props(props)
    const project_count = Object.keys(priorities_by_project).length
    const max_y = project_priority_y(project_count)

    return [<CurrentDatetimeLine max_y={max_y} display_last_n_months={5} />]
}



const get_children = (props: Props, state: State, set_state: (s: Partial<State>) => void) =>
{
    const {
        project_priority_nodes,
        daily_action_nodes,
    } = get_derived_props(props)

    const elements = [
        ...project_priority_nodes.map(node_props => <ProjectPriorityNode {...node_props} />),
        ...daily_action_nodes.map(node_props => <DailyActionNode
            {...node_props}
            set_action_ids_to_show={action_ids_to_show => set_state({ action_ids_to_show })}
        />),
    ]

    const content_coordinates: CanvasPoint[] = []
    if (project_priority_nodes.length)
    {
        const { x: left, y: top } = project_priority_nodes[0]
        content_coordinates.push({ left, top })
    }

    return { elements, content_coordinates }
}


const get_content_controls = (props: Props, state: State, set_state: (s: Partial<State>) => void) =>
{
    const elements = [
        <MainContentControls
            events={props.project_priorities}
            data_set_name="priorities"
        />,
    ]

    if (state.action_ids_to_show.length > 0)
    {
        elements.push(<DailyActionsList
            action_ids_to_show={state.action_ids_to_show}
            on_close={() => set_state({ action_ids_to_show: [] })}
        />)
    }

    return elements
}


export function PrioritiesViewController (view_needs_to_update: () => void)
{
    return new ViewController<Props, State>({
        view_needs_to_update,
        map_state,
        get_initial_state,
        get_children,
        get_svg_children,
        get_content_controls,
    })
}


function get_derived_props (props: Props)
{
    const {
        project_priorities,
        order_args,
        display_at_datetime_ms,
        daily_actions_meta,
    } = props

    const unordered_priorities_by_project = group_priorities_by_project(project_priorities)
    const priorities_by_project = order_priorities_by_project(unordered_priorities_by_project, order_args)
    const project_priority_nodes = convert_project_priorities_to_nodes({
        priorities_by_project,
        display_at_datetime_ms,
    })

    const project_id_to_vertical_position = get_project_id_to_vertical_position(priorities_by_project)
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
