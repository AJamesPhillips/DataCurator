import { h } from "preact"

import "./Handles.scss"
import { ExploreButtonHandle, ExploreButtonHandleOwnProps } from "./ExploreButtonHandle"
import { OverlappingNodesHandle } from "./OverlappingNodesHandle"



interface HandlesProps extends HandleForMovingProps, ExploreButtonHandleOwnProps {}
export function Handles (props: HandlesProps)
{
    return <div className="handles">
        <HandleForMoving user_requested_node_move={props.user_requested_node_move} />
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
    user_requested_node_move?: () => void
}
function HandleForMoving (props: HandleForMovingProps)
{
    const { user_requested_node_move: set_node_is_moving } = props

    if (!set_node_is_moving) return <div
        className="node_handle movement"
    >&nbsp;</div>


    const handle_pointer_down = (e: h.JSX.TargetedEvent<HTMLDivElement, PointerEvent>) =>
    {
        e.stopPropagation() // stop propagation otherwise ConnectionNode will become deselected / selected
        set_node_is_moving()
    }

    return <div
        className="node_handle movement"
        onPointerDown={handle_pointer_down}
    >&#10021;</div>
}
