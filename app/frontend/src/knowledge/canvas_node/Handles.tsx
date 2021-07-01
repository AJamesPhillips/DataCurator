import { h } from "preact"

import "./Handles.scss"
import { ExploreButtonHandle, ExploreButtonHandleOwnProps } from "./ExploreButtonHandle"



interface HandlesProps extends HandleForMovingProps, ExploreButtonHandleOwnProps {}
export function Handles (props: HandlesProps)
{
    return <div className="handles">
        <HandleForMoving set_node_is_moving={props.set_node_is_moving} />
        <ExploreButtonHandle
            wcomponent_id={props.wcomponent_id}
            wcomponent_current_kv_entry={props.wcomponent_current_kv_entry}
            is_highlighted={props.is_highlighted}
        />
    </div>
}



interface HandleForMovingProps
{
    set_node_is_moving?: () => void
}
function HandleForMoving (props: HandleForMovingProps)
{
    const { set_node_is_moving } = props

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
