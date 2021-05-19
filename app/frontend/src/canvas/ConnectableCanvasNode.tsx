import { h } from "preact"

import "./ConnectableCanvasNode.css"
import { CanvasNode } from "./CanvasNode"
import { COLOURS } from "./display"
import type { CanvasPoint } from "./interfaces"
import type { ConnectionLocationType } from "../shared/wcomponent/interfaces/SpecialisedObjects"



const connection_position_left = 50
const connection_position_bottom = 66
const connection_diameter = 6
const connection_radius = connection_diameter / 2
const connection_top = 6
const connection_left_left = 6
const connection_left_top = connection_position_bottom / 2


interface OwnProps
{
    get_ref?: (ref: HTMLDivElement) => void
    position: CanvasPoint
    node_main_content: h.JSX.Element[]
    hidden?: boolean
    unlimited_width?: boolean
    glow?: false | "blue" | "orange"
    color?: string
    extra_css_class?: string
    other_children?: h.JSX.Element[]
    on_pointer_down?: () => void
    on_click?: () => void
    on_pointer_enter?: () => void
    on_pointer_leave?: () => void
    pointerupdown_on_connection_terminal?: (connection_location: ConnectionLocationType, up_down: "up" | "down") => void
    extra_args?: h.JSX.HTMLAttributes<HTMLDivElement>
}



export function ConnectableCanvasNode (props: OwnProps)
{
    const extra_node_styles: h.JSX.CSSProperties =
    {
        minWidth: 100,
        padding: "6px 10px",
        display: props.hidden ? "none": ""
    }
    if (props.unlimited_width) extra_node_styles.maxWidth = "initial"

    const main_content_styles: h.JSX.CSSProperties =
    {
        boxShadow: props.glow ? `0px 0px 5px ${props.glow}` : "",
        backgroundColor: props.color || COLOURS.white,
    }

    const connection_style_top: h.JSX.CSSProperties =
    {
        left: connection_position_left,
        top: connection_top - connection_radius,
        width: connection_diameter,
        height: connection_diameter,
        borderRadius: connection_radius + 1,
    }
    const connection_style_bottom: h.JSX.CSSProperties =
    {
        ...connection_style_top,
        top: connection_position_bottom - connection_radius,
    }
    const connection_style_left: h.JSX.CSSProperties =
    {
        ...connection_style_top,
        left: connection_left_left,
        top: connection_left_top,
    }

    const {
        pointerupdown_on_connection_terminal = () => {},
    } = props

    return <CanvasNode
        get_ref={ref => props.get_ref && props.get_ref(ref)}
        position={props.position}
        on_pointer_down={props.on_pointer_down}
        on_click={props.on_click}
        on_pointer_enter={props.on_pointer_enter}
        on_pointer_leave={props.on_pointer_leave}
        extra_css_class={" connectable_canvas_node max_width200 " + (props.extra_css_class || "")}
        extra_styles={extra_node_styles}
        extra_args={props.extra_args}
    >
        <div className="node_main_content" style={main_content_styles}>
            {props.node_main_content}
        </div>
        <div
            className="connection_terminal"
            style={connection_style_top}
            onPointerDown={e => { e.stopPropagation(); pointerupdown_on_connection_terminal("top", "down") }}
            onPointerUp={e => { e.stopPropagation(); pointerupdown_on_connection_terminal("top", "up") }}
        />
        <div
            className="connection_terminal"
            style={connection_style_bottom}
            onPointerDown={e => { e.stopPropagation(); pointerupdown_on_connection_terminal("bottom", "down") }}
            onPointerUp={e => { e.stopPropagation(); pointerupdown_on_connection_terminal("bottom", "up") }}
        />
        <div
            className="connection_terminal"
            style={connection_style_left}
            onPointerDown={e => { e.stopPropagation(); pointerupdown_on_connection_terminal("left", "down") }}
            onPointerUp={e => { e.stopPropagation(); pointerupdown_on_connection_terminal("left", "up") }}
        />
        {props.other_children}
    </CanvasNode>
}



export function _get_connection_point (objective_node_position: CanvasPoint, location: ConnectionLocationType): CanvasPoint
{
    const top_offset = location === "top" ? connection_top : (
        location === "bottom" ? connection_position_bottom : (connection_left_top + connection_radius))

    const left_offset = location === "left"
        ? connection_left_left + connection_radius
        : connection_position_left + connection_radius + 1

    return {
        left: objective_node_position.left + left_offset + 1,
        top: objective_node_position.top + top_offset,
    }
}
