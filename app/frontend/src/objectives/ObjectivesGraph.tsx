import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { Canvas } from "../canvas/Canvas"
import type { RootState } from "../state/State"
import { performance_logger } from "../utils/performance"
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


function _ObjectivesGraph (props: Props)
{
    performance_logger("ObjectivesGraph...")

    return <Canvas
        svg_children={props.objective_connections_props.map(p => <ObjectiveConnnection {...p} />)}
    >
        {props.objective_nodes_props.map(p => <ObjectiveNode {...p} />)}
    </Canvas>
}


export const ObjectivesGraph = connector(_ObjectivesGraph) as FunctionalComponent<{}>


// _._     _,-'""`-._
// (,-.`._,'(       |\`-/|
//     `-.-' \ )-`( , o o)
//           `-    \`_`"'-
// I love koalas
