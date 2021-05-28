import { h } from "preact"

import "./Handles.css"



interface HandlesProps extends HandleForMovingProps {}
export function Handles (props: HandlesProps)
{
    return <div className="handles">
        <HandleForMoving set_node_is_moving={props.set_node_is_moving} />
        <ExploreButton />
    </div>
}



interface HandleForMovingProps
{
    set_node_is_moving: () => void
}
function HandleForMoving (props: HandleForMovingProps)
{
    const handle_pointer_down = (e: h.JSX.TargetedEvent<HTMLDivElement, PointerEvent>) =>
    {
        e.stopPropagation() // stop propagation otherwise ConnectionNode will become deselected / selected
        props.set_node_is_moving()
    }

    return <div
        className="node_handle movement"
        onPointerDown={handle_pointer_down}
    >&#10021;</div>
}


function ExploreButton ()
{
    return <div className="node_handle explore">&#128269;</div>
}
