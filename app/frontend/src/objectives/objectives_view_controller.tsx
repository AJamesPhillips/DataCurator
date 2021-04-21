import { h } from "preact"
import { vertical_ordinal_to_y, x } from "../canvas/display"
import type { CanvasPoint } from "../canvas/interfaces"

import { ViewController } from "../layout/ViewController"
import type { RootState } from "../state/State"
import { get_objective_connections_props_c } from "./get_objective_connections"
import { get_objective_nodes_props_c } from "./get_objective_nodes"
import { ObjectiveConnnection } from "./ObjectiveConnnection"
import { ObjectiveNode } from "./ObjectiveNode"
import { objectives_data } from "./temp_data"


const map_state = (state: RootState) => {
    const objective_nodes_props = get_objective_nodes_props_c(objectives_data)
    const objective_connections_props = get_objective_connections_props_c(objective_nodes_props)

    const one_or_more_nodes_selected = (
        state.objectives.selected_objective_ids.size !== 0
        || state.objectives.priority_selected_objective_ids.size !== 0
    )

    return {
        one_or_more_nodes_selected,
        objective_nodes_props,
        objective_connections_props,
    }
}

type Props = ReturnType<typeof map_state>


const get_svg_children = (props: Props) => []


const get_children = (props: Props) => {
    const elements = props.objective_nodes_props.map(p => <ObjectiveNode {...p} />)

    const content_coordinates: CanvasPoint[] = []
    if (props.objective_nodes_props.length)
    {
        const { created_at, vertical_ordinal } = props.objective_nodes_props[0]
        const left = x(created_at.getTime())
        const top = vertical_ordinal_to_y(vertical_ordinal)
        content_coordinates.push({ left, top })
    }

    return { elements, content_coordinates, }
}


const get_svg_upper_children = (props: Props) =>
    [<g className={props.one_or_more_nodes_selected ? "highlighting_connection_lines" : ""}>
        {props.objective_connections_props.map(p => <ObjectiveConnnection {...p} />)}
    </g>]


export function ObjectivesViewController (view_needs_to_update: () => void)
{

    return new ViewController<Props, {}>({
        view_needs_to_update,
        map_state,
        get_initial_state: () => ({}),
        get_svg_children,
        get_children,
        get_svg_upper_children,
    })

    // get_content_controls = () => <div>Content controls </div>
}
