import { ComponentChildren, h } from "preact"

import type { NodePositionAndDimensions } from "./interfaces"



interface CanvasNodeProps
{
    position?: NodePositionAndDimensions
    extra_styles?: h.JSX.CSSProperties
    display?: boolean
    extra_css_class?: string
    title?: string
    on_pointer_enter?: (e: h.JSX.TargetedEvent<HTMLDivElement, PointerEvent>) => void
    on_pointer_leave?: (e: h.JSX.TargetedEvent<HTMLDivElement, PointerEvent>) => void
    on_pointer_down?: (e: h.JSX.TargetedEvent<HTMLDivElement, PointerEvent>) => void
    on_pointer_up?: (e: h.JSX.TargetedEvent<HTMLDivElement, PointerEvent>) => void
    on_click?: (e: h.JSX.TargetedEvent<HTMLDivElement, MouseEvent>) => void
    extra_args?: h.JSX.HTMLAttributes<HTMLDivElement>
    children: ComponentChildren
}



export function CanvasNode (props: CanvasNodeProps)
{
    const { position, extra_styles, display, extra_css_class, title, children } = props
    const { on_pointer_enter, on_pointer_leave, on_pointer_down, on_pointer_up, on_click } = props

    const style_outer: h.JSX.CSSProperties = {
        ...position,
        position: position ? "absolute" : "relative",
        display: display === undefined ? "" : (display ? "" : "none"),
        ...extra_styles,
    }

    const mouseable = (on_pointer_down || on_pointer_up || on_click || on_pointer_enter || on_pointer_leave) ? "mouseable" : ""

    const css_class_names = `node ${mouseable} ${extra_css_class || ""}`

    return <div
        {...props.extra_args}
        className={css_class_names}
        style={style_outer}
        title={title}
        // Provide a default on_pointer_down function otherwise the canvas will (may) steal the event which
        // prevents any on_click or on_pointer_up handlers from firing
        onPointerDown={on_pointer_down || (e => { e.stopImmediatePropagation(); e.preventDefault() })}
        onPointerUp={on_pointer_up}
        onClick={on_click}
        onPointerEnter={on_pointer_enter}
        onPointerLeave={on_pointer_leave}
        onContextMenu={e =>
        {
            // Currently when the ctrl key is depressed so that multiple elements can be selected
            // when a node is clicked, the context menu appears and interferes with this process
            // TODO make this conditional on trying to select multiple nodes
            e.preventDefault()
        }}
    >
        {children}
    </div>
}
