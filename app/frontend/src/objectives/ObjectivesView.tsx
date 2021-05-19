import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { Canvas } from "../canvas/Canvas"
import { x, vertical_ordinal_to_y } from "../canvas/display"
import type { ContentCoordinate } from "../canvas/interfaces"
import { MainArea } from "../layout/MainArea"
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

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>


const get_children = (props: Props) => {
    const elements = props.objective_nodes_props.map(p => <ObjectiveNode {...p} />)

    const content_coordinates: ContentCoordinate[] = []
    if (props.objective_nodes_props.length)
    {
        const { created_at, vertical_ordinal } = props.objective_nodes_props[0]!
        const left = x(created_at.getTime())
        const top = vertical_ordinal_to_y(vertical_ordinal)
        content_coordinates.push({ left, top, zoom: 100 })
    }

    return { elements, content_coordinates, }
}


const get_svg_upper_children = (props: Props) =>
    [<g className={props.one_or_more_nodes_selected ? "highlighting_connection_lines" : ""}>
        {props.objective_connections_props.map(p => <ObjectiveConnnection {...p} />)}
    </g>]



function _ObjectivesView (props: Props)
{
    const { elements, content_coordinates } = get_children(props)

    return <MainArea
        main_content={<Canvas
            svg_children={[]}
            svg_upper_children={get_svg_upper_children(props)}
            content_coordinates={content_coordinates}
        >
            {elements}
        </Canvas>}
    />
}

export const ObjectivesView = connector(_ObjectivesView) as FunctionalComponent<{}>
