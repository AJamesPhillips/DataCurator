import { Component, FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import type { Dispatch } from "redux"

import "./Canvas.css"
import type { RootState } from "../state/State"
import { ACTIONS } from "../state/actions"
import { performance_logger } from "../utils/performance"
import type { CanvasPoint } from "./interfaces"
import { lefttop_to_xy, MoveToPositionButton } from "./MoveToPositionButton"
import { bound_zoom, scale_by, calculate_new_zoom, calculate_new_zoom_xy } from "./zoom_utils"
import { BoundingRect, bounding_rects_equal } from "../state/display/state"



interface OwnProps
{
    svg_children?: preact.ComponentChildren[]
    svg_upper_children?: preact.ComponentChildren[]
    content_coordinates?: CanvasPoint[]
}


const map_state = (state: RootState) => {
    const zoom = state.routing.args.zoom
    const x = state.routing.args.x
    const y = state.routing.args.y
    const rotation = state.routing.args.rotation
    const bounding_rect = state.display.canvas_bounding_rect

    return { zoom, x, y, rotation, bounding_rect }
}


interface ChangeRoutingArgsArgs { x?: number, y?: number, zoom?: number }
const map_dispatch = (dispatch: Dispatch) => ({
    change_routing_args: (args: ChangeRoutingArgsArgs) => {
        let new_args: ChangeRoutingArgsArgs = {}
        if (args.zoom !== undefined) new_args.zoom = Math.round(bound_zoom(args.zoom))
        if (args.x !== undefined) new_args.x = Math.round(args.x)
        if (args.y !== undefined) new_args.y = Math.round(args.y)

        dispatch(ACTIONS.routing.change_route({ args: new_args }))
    },
    update_bounding_rect: (bounding_rect: BoundingRect | null, current_br: BoundingRect | undefined) =>
    {
        if (!bounding_rect) return

        if (bounding_rects_equal(bounding_rect, current_br)) return

        dispatch(ACTIONS.display.update_canvas_bounding_rect({ bounding_rect }))
    }
})



const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


type PointerState =
{
    down: false
    client_start_x: null
    client_start_y: null
    canvas_start_x: null
    canvas_start_y: null
} | {
    down: true
    client_start_x: number
    client_start_y: number
    canvas_start_x: number
    canvas_start_y: number
}


class _Canvas extends Component<Props>
{
    private pointer_state: PointerState = {
        down: false,
        client_start_x: null,
        client_start_y: null,
        canvas_start_x: null,
        canvas_start_y: null,
    }

    on_pointer_down = (e: h.JSX.TargetedEvent<HTMLDivElement, MouseEvent>) => {
        this.pointer_state.down = true
        this.pointer_state.client_start_x = e.clientX
        this.pointer_state.client_start_y = e.clientY
        this.pointer_state.canvas_start_x = this.props.x
        this.pointer_state.canvas_start_y = this.props.y
    }

    on_pointer_up = () => { this.pointer_state.down = false }

    on_pointer_move = (e: h.JSX.TargetedEvent<HTMLDivElement, MouseEvent>) => {

        // // This is a hack because onPointerCapture is not as flexible as we wanted.
        // if ((e.currentTarget as any).on_pointer_move_subscribers)
        // {
        //     (e.currentTarget as any).on_pointer_move_subscribers.forEach(on_pointer_move_subscriber =>
        //     {
        //         on_pointer_move_subscriber(e)
        //     })
        // }

        if (this.pointer_state.down)
        {
            // Values are independent of zoom
            const change_in_x = e.clientX - this.pointer_state.client_start_x
            const change_in_y = e.clientY - this.pointer_state.client_start_y

            // zoom aware values
            const dx = change_in_x * (scale_by / this.props.zoom )
            const dy = change_in_y * (scale_by / this.props.zoom )

            const x = this.pointer_state.canvas_start_x - dx
            const y = this.pointer_state.canvas_start_y + dy

            this.props.change_routing_args({ x, y })
        }
    }

    on_wheel = (e: h.JSX.TargetedEvent<HTMLDivElement, WheelEvent>) =>
    {
        e.stopPropagation()

        const { bounding_rect } = this.props
        if (!bounding_rect) return

        const wheel_change = e.deltaY
        const new_zoom = calculate_new_zoom({ zoom: this.props.zoom, wheel_change })
        if (new_zoom === this.props.zoom) return

        const { clientX: pointer_x, clientY: pointer_y } = e
        const result = calculate_new_zoom_xy({ old: this.props, new_zoom, bounding_rect, pointer_x, pointer_y })

        this.props.change_routing_args({ zoom: new_zoom, x: result.x, y: result.y })
    }

    render ()
    {
        const { zoom, rotation, bounding_rect, content_coordinates = [], update_bounding_rect } = this.props

        const scale = zoom / scale_by
        performance_logger("Canvas...")
        const x = -1 * this.props.x * scale
        const y = this.props.y * scale

        const background_style = {
            backgroundPosition: `${x}px ${y}px`,
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
            height: "100%",
        }
        const html_translation_container_style = {
            transform: `translate(${x}px,${y}px)`
        }
        const html_container_style = {
            transformOrigin: "left top",
            transform: `scale(${scale}) rotate(${rotation}deg)`
        }

        return (
        <div style={{ height: "100%" }}
            // This has the potential to form part of a feedback loop
            ref={r => update_bounding_rect(r && r.getBoundingClientRect(), bounding_rect)}
        >
            <div
                id="graph_container"
                style={background_style}
                onPointerDown={this.on_pointer_down}
                onPointerMove={this.on_pointer_move}
                onPointerUp={this.on_pointer_up}
                onWheel={this.on_wheel}
                onDragOver={e =>
                    {
                        // Prevent drag end animation
                        // https://stackoverflow.com/a/51697038/539490
                        e.preventDefault()
                        // Prevent green circle with white cross "copy / add" cursor icon
                        // https://stackoverflow.com/a/56699962/539490
                        e.dataTransfer!.dropEffect = "move"
                    }}
            >
                <div id="graph_visuals_container" style={html_translation_container_style}>
                    <div style={html_container_style}>
                        <svg style={{ zIndex: 0, position: "absolute", top: 0, left: 0 }}>
                            {blur_filter_defs}
                            {this.props.svg_children}
                        </svg>

                        {this.props.children}

                        <svg style={{ zIndex: 2, position: "absolute", top: 0, left: 0 }}>
                            {blur_filter_defs}
                            {this.props.svg_upper_children}
                        </svg>
                    </div>
                </div>
            </div>

            {content_coordinates.length === 0 ? null : <div style={{ position: "relative", bottom: "20px" }}>
                <MoveToPositionButton
                    description="Move to content"
                    move_to_xy={lefttop_to_xy(content_coordinates![0])}
                />
            </div>}
        </div>
        )
    }
}


export const Canvas = connector(_Canvas) as FunctionalComponent<OwnProps>


const blur_filter_defs = <defs>
    {Array.from(Array(101)).map((_, i) => <filter id={"blur_filter_" + i} x="0" y="0">
        <feGaussianBlur in="SourceGraphic" stdDeviation={i / 20} />
    </filter>)}
</defs>
