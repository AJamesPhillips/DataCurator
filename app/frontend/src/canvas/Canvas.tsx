import { Component, FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import type { Dispatch } from "redux"

import "./Canvas.css"
import { ACTIONS } from "../state/actions"
import { lefttop_to_xy } from "../state/display_options/display"
import { BoundingRect, bounding_rects_equal } from "../state/display_options/state"
import { pub_sub } from "../state/pub_sub/pub_sub"
import type { RootState } from "../state/State"
import type { ContentCoordinate } from "./interfaces"
import { MoveToPositionButton } from "./MoveToPositionButton"
import { grid_small_step } from "./position_utils"
import { bound_zoom, scale_by, calculate_new_zoom, calculate_new_zoom_xy } from "./zoom_utils"
import { SelectionBox } from "./SelectionBox"
import type { CanvasAreaSelectEvent } from "../state/canvas/pub_sub"



const MAX_DOUBLE_TAP_DELAY_MS = 900
const MAX_DOUBLE_TAP_XY_PIXEL_MOVEMENT = 10


interface OwnProps
{
    svg_children?: preact.ComponentChildren[]
    svg_upper_children?: preact.ComponentChildren[]
    content_coordinates?: ContentCoordinate[]
    plain_background?: boolean
}


const map_state = (state: RootState) => {
    const zoom = state.routing.args.zoom
    const x = state.routing.args.x
    const y = state.routing.args.y
    const bounding_rect = state.display_options.canvas_bounding_rect
    const shift_key_down = state.global_keys.keys_down.has("Shift")
    const control_key_down = state.global_keys.keys_down.has("Control")

    return { zoom, x, y, bounding_rect, shift_key_down, control_key_down }
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
    },
})



const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


type PointerState =
{
    down: false
    area_select: false
    last_pointer_down_ms: number | undefined
    client_start_x: number | undefined
    client_start_y: number | undefined
    canvas_start_x: number | undefined
    canvas_start_y: number | undefined
} | {
    down: true
    area_select: boolean
    last_pointer_down_ms: number | undefined
    client_start_x: number
    client_start_y: number
    canvas_start_x: number
    canvas_start_y: number
}


interface State
{
    pointer_state: PointerState
    client_current_x: number | undefined
    client_current_y: number | undefined
}


class _Canvas extends Component<Props, State>
{
    constructor (props: Props)
    {
        super(props)

        this.state = {
            pointer_state: {
                down: false,
                area_select: false,
                last_pointer_down_ms: undefined,
                client_start_x: undefined,
                client_start_y: undefined,
                canvas_start_x: undefined,
                canvas_start_y: undefined,
            },
            client_current_x: undefined,
            client_current_y: undefined,
        }
    }


    // zoom aware values
    client_to_canvas = (client_xy: number) => client_xy * (scale_by / this.props.zoom)
    client_to_canvas_x = (client_x: number) =>
    {
        const { canvas_start_x = 0 } = this.state.pointer_state
        return canvas_start_x + this.client_to_canvas(client_x)
    }
    client_to_canvas_y = (client_y: number) =>
    {
        const { canvas_start_y = 0 } = this.state.pointer_state
        return canvas_start_y - this.client_to_canvas(client_y)
    }


    on_pointer_down = (e: h.JSX.TargetedEvent<HTMLDivElement, MouseEvent>) =>
    {
        const new_pointer_state: PointerState =
        {
            down: true,
            area_select: this.props.shift_key_down,
            last_pointer_down_ms: new Date().getTime(),
            client_start_x: e.clientX,
            client_start_y: e.clientY,
            canvas_start_x: this.props.x,
            canvas_start_y: this.props.y,
        }

        handle_if_double_tap({
            current_pointer_state: this.state.pointer_state,
            new_pointer_state,
            client_to_canvas_x: this.client_to_canvas_x,
            client_to_canvas_y: this.client_to_canvas_y,
        })
        this.setState({
            pointer_state: new_pointer_state,
            client_current_x: e.clientX,
            client_current_y: e.clientY,
        })
    }


    on_pointer_up = () =>
    {
        if (this.state.pointer_state.area_select)
        {
            const args = area_selection_args(this.state)
            const canvas_area_select: CanvasAreaSelectEvent = {
                start_x: this.client_to_canvas_x(args.client_start_x),
                start_y: this.client_to_canvas_y(args.client_start_y),
                end_x: this.client_to_canvas_x(args.client_end_x),
                end_y: this.client_to_canvas_y(args.client_end_y),
            }

            pub_sub.canvas.pub("canvas_area_select", canvas_area_select)
        }

        const new_pointer_state: PointerState =
        {
            ...this.state.pointer_state,
            down: false,
            area_select: false,
        }
        this.setState({ pointer_state: new_pointer_state, client_current_x: undefined, client_current_y: undefined })
    }


    on_pointer_leave = () =>
    {
        // When pointer leaves the screen or canvas cancel the pointer being down if not dragging a selection
        if (!this.state.pointer_state.area_select) this.on_pointer_up()
    }


    on_pointer_move = (e: h.JSX.TargetedEvent<HTMLDivElement, MouseEvent>) =>
    {
        if (!this.state.pointer_state.down) return

        if (this.state.pointer_state.area_select)
        {
            this.setState({
                client_current_x: e.clientX,
                client_current_y: e.clientY,
            })
        }
        else
        {
            // Values are independent of zoom
            const change_in_client_x = this.state.pointer_state.client_start_x - e.clientX
            const change_in_client_y = this.state.pointer_state.client_start_y - e.clientY

            const x = this.client_to_canvas_x(change_in_client_x)
            const y = this.client_to_canvas_y(change_in_client_y)

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


    on_context_menu = (e: h.JSX.TargetedEvent<HTMLDivElement, MouseEvent>) =>
    {
        e.stopPropagation()
        e.preventDefault()

        const x = this.client_to_canvas_x(e.clientX)
        const y = this.client_to_canvas_y(e.clientY)

        pub_sub.canvas.pub("canvas_right_click", { x, y })
    }


    render ()
    {
        const { zoom, bounding_rect, content_coordinates = [], update_bounding_rect } = this.props

        const scale = zoom / scale_by
        const x = -1 * this.props.x * scale
        const y = this.props.y * scale

        const backgroundSize = grid_small_step * scale
        const background_style = {
            backgroundPosition: `${x}px ${y}px`,
            backgroundSize: `${backgroundSize}px ${backgroundSize}px`,
            height: "100%",
        }
        const html_translation_container_style = {
            transform: `translate(${x}px,${y}px)`
        }
        const html_container_style = {
            transformOrigin: "left top",
            transform: `scale(${scale})`
        }


        return (
        <div style={{ height: "100%" }}
            // This has the potential to form part of a feedback loop
            ref={r => update_bounding_rect(r && r.getBoundingClientRect(), bounding_rect)}
        >
            <div
                id="graph_container"
                className={this.props.plain_background ? "" : "squared_background"}
                style={background_style}
                onPointerDown={this.on_pointer_down}
                onPointerMove={this.on_pointer_move}
                onPointerUp={this.on_pointer_up}
                onPointerLeave={this.on_pointer_leave}
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
                onContextMenu={this.on_context_menu}
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

                {this.state.pointer_state.area_select && <SelectionBox
                    {...area_selection_args(this.state)}
                    color={this.props.control_key_down ? "red" : "blue"}
                />}
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



interface HandleIfDoubleTapArgs
{
    current_pointer_state: PointerState
    new_pointer_state: PointerState
    client_to_canvas_x: (x: number) => number
    client_to_canvas_y: (y: number) => number
}
function handle_if_double_tap (args: HandleIfDoubleTapArgs)
{
    const {
        current_pointer_state,
        new_pointer_state,
        client_to_canvas_x,
        client_to_canvas_y,
    } = args

    // first click
    if (!current_pointer_state.last_pointer_down_ms) return

    // type guard
    if (!new_pointer_state.last_pointer_down_ms) return

    // check if too slow
    const time_between_pointer_down = new_pointer_state.last_pointer_down_ms - current_pointer_state.last_pointer_down_ms
    if (time_between_pointer_down > MAX_DOUBLE_TAP_DELAY_MS) return

    const { client_start_x: current_x, client_start_y: current_y } = current_pointer_state
    const { client_start_x: new_x, client_start_y: new_y } = new_pointer_state

    // type guard
    if (current_x === undefined || current_y === undefined || new_x === undefined || new_y === undefined) return

    // check if moved too far
    const x_movement = Math.abs(current_x - new_x)
    const y_movement = Math.abs(current_y - new_y)
    if (x_movement > MAX_DOUBLE_TAP_XY_PIXEL_MOVEMENT) return
    if (y_movement > MAX_DOUBLE_TAP_XY_PIXEL_MOVEMENT) return

    const x = client_to_canvas_x(current_x)
    const y = client_to_canvas_y(current_y)

    console.log({ x, y })
    pub_sub.canvas.pub("canvas_double_tap", { x, y })
}



function area_selection_args (state: Readonly<State>)
{
    const client_start_x = state.pointer_state.client_start_x || 0
    const client_start_y = state.pointer_state.client_start_y || 0
    const client_current_x = state.client_current_x || 0
    const client_current_y = state.client_current_y || 0

    return {
        client_start_x: Math.min(client_start_x, client_current_x),
        client_start_y: Math.min(client_start_y, client_current_y),
        client_end_x: Math.max(client_start_x, client_current_x),
        client_end_y: Math.max(client_start_y, client_current_y),
    }
}
