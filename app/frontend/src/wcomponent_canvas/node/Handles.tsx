import { h } from "preact"

import "./Handles.scss"
import { ExploreButtonHandle, ExploreButtonHandleOwnProps } from "./ExploreButtonHandle"
import { OverlappingNodesHandle } from "./OverlappingNodesHandle"
import type { Position } from "../../canvas/interfaces"
import { get_store } from "../../state/store"
import { client_to_canvas_x, client_to_canvas_y } from "../../canvas/canvas_utils"



interface HandlesProps extends HandleForMovingProps, ExploreButtonHandleOwnProps {}
export function Handles (props: HandlesProps)
{
    return <div className="handles">
        <HandleForMoving
            show_move_handle={props.show_move_handle}
            user_requested_node_move={props.user_requested_node_move}
        />
        <ExploreButtonHandle
            wcomponent_id={props.wcomponent_id}
            wcomponent_current_kv_entry={props.wcomponent_current_kv_entry}
            is_highlighted={props.is_highlighted}
        />
        <OverlappingNodesHandle
            wcomponent_id={props.wcomponent_id}
        />
    </div>
}



interface HandleForMovingProps
{
    show_move_handle: boolean
    user_requested_node_move: (position: Position) => void
}
function HandleForMoving (props: HandleForMovingProps)
{
    const { show_move_handle, user_requested_node_move } = props

    if (!show_move_handle) return <div
        className="node_handle movement"
    >&nbsp;</div>


    const handle_pointer_down = (e: h.JSX.TargetedEvent<HTMLDivElement, PointerEvent>) =>
    {
        e.stopPropagation() // stop propagation otherwise ConnectionNode will become deselected / selected
        const position: Position = canvas_pointer_event_to_position(e)

        user_requested_node_move(position)
    }

    return <div
        className="node_handle movement"
        onPointerDown={handle_pointer_down}
    >&#10021;</div>
}



function canvas_pointer_event_to_position (e: h.JSX.TargetedEvent<HTMLDivElement, PointerEvent>): Position
{
    const state = get_store().getState()
    const { x, y, zoom } = state.routing.args

    return {
        x: client_to_canvas_x(x, zoom, e.clientX),
        y: client_to_canvas_y(y, zoom, e.clientY),
    }
}
