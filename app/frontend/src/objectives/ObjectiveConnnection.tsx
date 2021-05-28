import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { CanvasConnnection } from "../canvas/connections/CanvasConnnection"
import type { RootState } from "../state/State"
import { get_objective_node_position } from "./get_objective_nodes"
import type { ObjectiveConnection } from "./interfaces"



interface OwnProps extends ObjectiveConnection {}


const map_state = (state: RootState, own_props: OwnProps) =>
{
    const { selected_objective_ids: selected, priority_selected_objective_ids: priority } = state.objectives

    const is_highlighted = (
        (priority.size === 0 && selected.has(own_props.from_id))
        || priority.has(own_props.from_id)
        || priority.has(own_props.to_id)
    )

    return {
        is_highlighted,
    }
}



const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _ObjectiveConnnection (props: Props)
{
    const from_node_position = get_objective_node_position({
        created_at_ms: props.from_ms,
        vertical_ordinal: props.from_vertical_ordinal,
    })

    const to_node_position = get_objective_node_position({
        created_at_ms: props.to_ms,
        vertical_ordinal: props.to_vertical_ordinal,
    })

    return <CanvasConnnection
        from_node_position={from_node_position}
        to_node_position={to_node_position}
        from_connection_type={{ attribute: "meta", direction: "from" }}
        to_connection_type={{ attribute: "meta", direction: "to" }}
        is_highlighted={props.is_highlighted}
    />
}

export const ObjectiveConnnection = connector(_ObjectiveConnnection) as FunctionalComponent<OwnProps>
