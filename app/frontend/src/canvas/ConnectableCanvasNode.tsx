import { h } from "preact"

import "./ConnectableCanvasNode.css"
import { CanvasNode } from "./CanvasNode"
import { COLOURS } from "./display"
import type { CanvasPoint } from "./interfaces"
import type { ConnectionLocationType } from "../shared/wcomponent/interfaces/SpecialisedObjects"



const connection_diameter = 12
const connection_radius = connection_diameter / 2

const connection_left = 3
const connection_right = 250 + 3
const connection_top = 27
const connection_top_increment = 22



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
    on_pointer_down?: (e: h.JSX.TargetedEvent<HTMLDivElement, PointerEvent>) => void
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
        display: props.hidden ? "none": ""
    }
    if (props.unlimited_width) extra_node_styles.maxWidth = "initial"

    const main_content_styles: h.JSX.CSSProperties =
    {
        boxShadow: props.glow ? `0px 0px 5px ${props.glow}` : "",
        backgroundColor: props.color || COLOURS.white,
    }

    const connection_style_common: h.JSX.CSSProperties =
    {
        width: connection_diameter,
        height: connection_diameter,
        borderRadius: connection_radius + 1,
    }
    // const connection_style_top: h.JSX.CSSProperties =
    // {
    //     ...connection_style_common,
    //     left: connection_position_left,
    //     top: connection_top - connection_radius,
    // }
    // const connection_style_bottom: h.JSX.CSSProperties =
    // {
    //     ...connection_style_common,
    //     left: connection_position_left,
    //     top: connection_position_bottom - connection_radius,
    // }
    const connection_style_left: h.JSX.CSSProperties =
    {
        ...connection_style_common,
        left: connection_left,
        top: connection_top,
    }
    const connection_style_left_2nd: h.JSX.CSSProperties =
    {
        ...connection_style_left,
        top: connection_top + (connection_top_increment * 1),
    }
    const connection_style_left_3: h.JSX.CSSProperties =
    {
        ...connection_style_left,
        top: connection_top + (connection_top_increment * 2),
    }
    const connection_style_right: h.JSX.CSSProperties =
    {
        ...connection_style_common,
        left: connection_right,
        top: connection_top,
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
        {/* <div
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
        /> */}
        <div
            className="connection_terminal"
            style={connection_style_left}
            onPointerDown={e => { e.stopPropagation(); pointerupdown_on_connection_terminal("left", "down") }}
            onPointerUp={e => { e.stopPropagation(); pointerupdown_on_connection_terminal("left", "up") }}
        />
        <div
            className="connection_terminal"
            style={connection_style_left_2nd}
            onPointerDown={e => {}}
            onPointerUp={e => {}}
        />
        <div
            className="connection_terminal"
            style={connection_style_left_3}
            onPointerDown={e => {}}
            onPointerUp={e => {}}
        />
        <div
            className="connection_terminal"
            style={connection_style_right}
            onPointerDown={e => { e.stopPropagation(); pointerupdown_on_connection_terminal("right", "down") }}
            onPointerUp={e => { e.stopPropagation(); pointerupdown_on_connection_terminal("right", "up") }}
        />
        {props.other_children}
    </CanvasNode>
}



const TODO_REMOVE_connection_position_bottom = 66
const TODO_REMOVE_connection_top = 6
export function _get_connection_point (objective_node_position: CanvasPoint, location: ConnectionLocationType): CanvasPoint
{
    const top_offset = location === "top" ? TODO_REMOVE_connection_top : (
        location === "bottom" ? TODO_REMOVE_connection_position_bottom : (
        location === "left" ? connection_top + connection_radius : connection_top + connection_radius ))

    const left_offset = location === "left" ? connection_left + connection_radius : (
        location === "right" ? connection_right + connection_radius
        // : connection_position_left + connection_radius + 1)
        : connection_left + connection_radius + 1)

    return {
        left: objective_node_position.left + left_offset + 1,
        top: objective_node_position.top + top_offset,
    }
}
