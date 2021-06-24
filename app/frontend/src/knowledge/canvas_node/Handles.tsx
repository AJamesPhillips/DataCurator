import { h } from "preact"

import "./Handles.css"
import { ExploreButtonHandle, ExploreButtonHandleOwnProps } from "./ExploreButtonHandle"



interface HandlesProps extends HandleForMovingProps, ExploreButtonHandleOwnProps {}
export function Handles (props: HandlesProps)
{
    return <div className="handles">
        <HandleForMoving set_node_is_moving={props.set_node_is_moving} />
        <ExploreButtonHandle
            wcomponent={props.wcomponent}
            wcomponent_current_kv_entry={props.wcomponent_current_kv_entry}
            editing={props.editing}
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

    if (!set_node_is_moving) return null


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
