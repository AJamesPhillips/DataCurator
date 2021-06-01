import { h } from "preact"

import "./ConnectableCanvasNode.css"
import { CanvasNode } from "./CanvasNode"
import { COLOURS } from "./display"
import type { CanvasPoint } from "./interfaces"
import type {
    ConnectionTerminalType,
} from "../shared/wcomponent/interfaces/SpecialisedObjects"
import { connection_radius, Terminal } from "./connections/terminal"



interface OwnProps
{
    get_ref?: (ref: HTMLDivElement) => void
    position: CanvasPoint
    node_main_content: h.JSX.Element
    hidden?: boolean
    unlimited_width?: boolean
    glow?: false | "blue" | "orange"
    color?: string
    extra_css_class?: string
    extra_node_styles?: h.JSX.CSSProperties
    other_children?: h.JSX.Element[]
    on_pointer_down?: (e: h.JSX.TargetedEvent<HTMLDivElement, PointerEvent>) => void
    on_click?: () => void
    on_pointer_enter?: () => void
    on_pointer_leave?: () => void
    terminals: Terminal[]
    pointerupdown_on_connection_terminal?: (type: ConnectionTerminalType, up_down: "up" | "down") => void
    extra_args?: h.JSX.HTMLAttributes<HTMLDivElement>
}


export function ConnectableCanvasNode (props: OwnProps)
{
    const extra_node_styles: h.JSX.CSSProperties =
    {
        display: props.hidden ? "none": "",
        ...props.extra_node_styles,
    }
    if (props.unlimited_width) extra_node_styles.maxWidth = "initial"

    const main_content_styles: h.JSX.CSSProperties =
    {
        boxShadow: props.glow ? `${props.glow} 0px 0px 5px` : "",
        backgroundColor: props.color || COLOURS.white,
    }


    const {
        pointerupdown_on_connection_terminal = () => {},
    } = props

    const extra_css_class = " connectable_canvas_node " + (props.extra_css_class || "")


    return <CanvasNode
        get_ref={ref => props.get_ref && props.get_ref(ref)}
        position={props.position}
        on_pointer_down={props.on_pointer_down}
        on_click={props.on_click}
        on_pointer_enter={props.on_pointer_enter}
        on_pointer_leave={props.on_pointer_leave}
        extra_css_class={extra_css_class}
        extra_styles={extra_node_styles}
        extra_args={props.extra_args}
    >
        <div className="node_main_content" style={main_content_styles}>
            {props.node_main_content}
        </div>

        {props.terminals.map(({ type, style, label }) =>
        {
            return <div
                className="connection_terminal"
                style={{ ...connection_style_common, ...style }}
                onPointerDown={e => { e.stopPropagation(); pointerupdown_on_connection_terminal(type, "down") }}
                onPointerUp={e => { e.stopPropagation(); pointerupdown_on_connection_terminal(type, "up") }}
            >{label}</div>
        })}

        {props.other_children}
    </CanvasNode>
}



const connection_diameter = connection_radius * 2
const connection_style_common: h.JSX.CSSProperties =
{
    width: connection_diameter,
    height: connection_diameter,
    borderRadius: connection_radius + 1,
}
