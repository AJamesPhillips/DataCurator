import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { ConnectableCanvasNode } from "../canvas/ConnectableCanvasNode"
import { COLOURS } from "../canvas/display"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { get_objective_node_position } from "./get_objective_nodes"
import type { ObjectiveNodeProps, ObjectiveType } from "./interfaces"



interface ObjectiveNodeOwnProps extends ObjectiveNodeProps {}


const map_state = (state: RootState, own_props: ObjectiveNodeOwnProps) => ({
    is_selected: state.objectives.selected_objective_ids.has(own_props.id),
    is_priority_selected: state.objectives.priority_selected_objective_ids.has(own_props.id),
    ctrl_key_is_down: state.global_keys.keys_down.has("Control"),
})

const map_dispatch = {
    select_objectives: ACTIONS.objectives.select_objectives,
    add_to_selected_objectives: ACTIONS.objectives.add_to_selected_objectives,
    remove_from_selected_objectives: ACTIONS.objectives.remove_from_selected_objectives,
    select_priority_objectives: ACTIONS.objectives.select_priority_objectives,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & ObjectiveNodeOwnProps



function get_colour (type: ObjectiveType)
{
    if (type === "value") return COLOURS.green
    if (type === "process") return COLOURS.yellow
    if (type === "state") return COLOURS.blue
    if (type === "event") return COLOURS.red
    return COLOURS.white
}


function _ObjectiveNode (props: Props)
{

    const on_click = () =>
    {
        if (props.is_selected)
        {
            if (props.ctrl_key_is_down) props.remove_from_selected_objectives([props.id])
            else props.select_objectives([])
        }
        else
        {
            if (props.ctrl_key_is_down) props.add_to_selected_objectives([props.id])
            else props.select_objectives([props.id])
        }
    }

    return <ConnectableCanvasNode
        position={get_objective_node_position(props)}
        node_main_content={[
            <div>{props.type}</div>,
            <b>{props.title}</b>
        ]}
        unlimited_width={(props.is_selected || props.is_priority_selected)}
        glow={(props.is_selected || props.is_priority_selected) && "blue"}
        color={get_colour(props.type)}
        on_click={on_click}
        on_pointer_enter={() => props.select_priority_objectives([props.id])}
        on_pointer_leave={() => props.select_priority_objectives([])}
    />
}


export const ObjectiveNode = connector(_ObjectiveNode) as FunctionalComponent<ObjectiveNodeOwnProps>
