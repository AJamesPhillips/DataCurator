import { Card, CardContent, CardMedia } from "@mui/material"
import { h } from "preact"

import type {
    ConnectionTerminalType,
} from "../wcomponent/interfaces/SpecialisedObjects"
import { CanvasNode } from "./CanvasNode"
import "./ConnectableCanvasNode.scss"
import { connection_radius, Terminal } from "./connections/terminal"
import "./display_colors.scss"
import type { CanvasPoint } from "./interfaces"



interface OwnProps
{
    cover_image?: string
    position?: CanvasPoint
    node_main_content: h.JSX.Element
    hidden?: boolean
    opacity?: number
    unlimited_width?: boolean
    glow?: false | "blue" | "orange"
    color?: string
    extra_css_class?: string
    extra_styles_for_node_main_content?: h.JSX.CSSProperties
    other_children?: h.JSX.Element[]
    on_pointer_down?: (e: h.JSX.TargetedEvent<HTMLDivElement, PointerEvent>) => void
    on_pointer_up?: (e: h.JSX.TargetedEvent<HTMLDivElement, PointerEvent>) => void
    on_click?: (e: h.JSX.TargetedEvent<HTMLDivElement, MouseEvent>) => void
    on_pointer_enter?: () => void
    on_pointer_leave?: () => void
    terminals: Terminal[]
    pointerupdown_on_connection_terminal?: (type: ConnectionTerminalType, up_down: "up" | "down") => void
    extra_args?: h.JSX.HTMLAttributes<HTMLDivElement>
}


export function ConnectableCanvasNode (props: OwnProps)
{
    let { opacity } = props
    // const [fade_inout_opacity, set_fade_inout_opacity] = useState(0)

    // Disabled as not performant at the moment
    // if (opacity !== undefined)
    // {
    //     if (fade_inout_opacity < opacity)
    //     {
    //         const new_opacity = Math.min(fade_inout_opacity + 0.3, opacity)
    //         setTimeout(() => set_fade_inout_opacity(new_opacity), 30)
    //     }

    //     opacity = fade_inout_opacity
    // }


    const extra_node_styles: h.JSX.CSSProperties = { display: props.hidden ? "none": "", opacity }
    if (props.unlimited_width) extra_node_styles.maxWidth = "initial"

    const main_content_styles: h.JSX.CSSProperties =
    {
        boxShadow: props.glow ? `${props.glow} 0px 0px 10px` : "",
        backgroundColor: props.color,
        ...props.extra_styles_for_node_main_content,
    }


    const {
        pointerupdown_on_connection_terminal = () => {},
    } = props

    const extra_css_class = " connectable_canvas_node " + (props.extra_css_class || "")


    return <CanvasNode
        position={props.position}
        on_pointer_down={props.on_pointer_down}
        on_pointer_up={props.on_pointer_up}
        on_click={props.on_click}
        on_pointer_enter={props.on_pointer_enter}
        on_pointer_leave={props.on_pointer_leave}
        extra_css_class={extra_css_class}
        extra_styles={extra_node_styles}
        extra_args={props.extra_args}
    >
    {/* <Box className="node_main_content" style={main_content_styles}> */}
        <Card
            className="node_main_content"
            variant="outlined"
            style={main_content_styles}
        >
            {(props.cover_image) && <CardMedia component="img"
                image={props.cover_image}
                className="node_image_content"
                onContextMenu={(e: h.JSX.TargetedMouseEvent<HTMLImageElement>) =>
                {
                    // This allows the right click default action to happen and offer users the
                    // menu to open the image in a new tab
                    e.stopImmediatePropagation()
                }}
            />}
            <CardContent
                // manually set padding to 16 as material-ui gives last child padding-bottom of 24px
                style={{ padding: 16 }}
            >
                {props.node_main_content}
            </CardContent>

            {props.terminals.map(({ type, style, label }) =>
            {
                return <div
                    className="connection_terminal"
                    style={{ ...connection_style_common, ...style }}
                    onPointerDown={e =>
                    {
                        e.stopPropagation()
                        pointerupdown_on_connection_terminal(type, "down")
                    }}
                    onPointerUp={e =>
                    {
                        e.stopPropagation()
                        pointerupdown_on_connection_terminal(type, "up")
                    }}
                >{label}</div>
            })}
        </Card>
    {/* </Box> */}

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
