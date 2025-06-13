import type { ContentCoordinate, PositionAndZoom } from "../../canvas/interfaces"
import { h_step, position_to_point, round_number, v_step } from "../../canvas/position_utils"
import { SCALE_BY } from "../../canvas/zoom_utils"
import { SIDE_PANEL_WIDTH } from "../../side_panel/width"
import { STARTING_ZOOM } from "../routing/starting_state"
import type { RootState } from "../State"



// todo improve how these are calculated
export const TOP_HEADER_FUDGE = 48
const bottom_controls_fudge = (display_time_sliders: boolean) => display_time_sliders ? 300 : 120
const side_panel_fudge = (display_side_panel: boolean) => display_side_panel ? SIDE_PANEL_WIDTH : 0

export const get_screen_width = (display_side_panel: boolean) => document.body.clientWidth - side_panel_fudge(display_side_panel)
export const get_visible_screen_height = (display_time_sliders: boolean) => document.body.clientHeight - TOP_HEADER_FUDGE - bottom_controls_fudge(display_time_sliders)

const half_screen_width = (display_side_panel: boolean) => get_screen_width(display_side_panel) / 2
const half_screen_height = (display_time_sliders: boolean) => get_visible_screen_height(display_time_sliders) / 2
function calculate_xy_for_middle (args: { x: number, y: number, zoom: number }, display_side_panel: boolean, display_time_sliders: boolean): { x: number, y: number }
{
    const x = round_number(args.x + (half_screen_width(display_side_panel) * (SCALE_BY / args.zoom)), h_step)
    const y = round_number(args.y - (half_screen_height(display_time_sliders) * (SCALE_BY / args.zoom)) + TOP_HEADER_FUDGE, v_step)

    return { x, y }
}

function calculate_xy_for_put_middle (args: { x: number, y: number, zoom: number }, display_args: DisplayArgs): { x: number, y: number }
{
    const x = args.x - (
        (half_screen_width(display_args.display_side_panel) * (SCALE_BY / args.zoom))
        // - (h_step / 2)
    )
    const y = args.y + (
        ((half_screen_height(display_args.display_time_sliders) + TOP_HEADER_FUDGE) * (SCALE_BY / args.zoom))
        // + (v_step / 2)
    )

    return { x, y }
}



export function get_middle_of_screen (state: RootState)
{
    const result = calculate_xy_for_middle(state.routing.args, state.controls.display_side_panel, state.controls.display_time_sliders)

    return position_to_point(result)
}



interface DisplayArgs
{
    display_side_panel: boolean
    display_time_sliders: boolean
}
const DEFAULT_DISPLAY_ARGS: DisplayArgs = { display_side_panel: false, display_time_sliders: false }

// Give some left/top component position, calculate the x/y for the canvas routing args to move
// the canvas to the component's position.  If `middle` is `false` then the component will be in the top
// left of the screen.  If `middle` is `true` then when the canvas updates and moves, then the component
// should be presented in the middle of the screen.
export function lefttop_to_xy (position: ContentCoordinate, middle?: boolean, display_args?: DisplayArgs): PositionAndZoom
export function lefttop_to_xy (position?: Partial<ContentCoordinate> | undefined, middle?: boolean, display_args?: DisplayArgs): PositionAndZoom | undefined
export function lefttop_to_xy (position?: Partial<ContentCoordinate> | undefined, middle?: boolean, display_args?: DisplayArgs): PositionAndZoom | undefined
{
    if (!position) return undefined

    const { left: x, top, zoom = STARTING_ZOOM } = position
    const y = top !== undefined ? -1 * top : undefined

    if (middle && x !== undefined && y !== undefined)
    {
        const middle_xy = calculate_xy_for_put_middle({ x, y, zoom }, display_args || DEFAULT_DISPLAY_ARGS)
        return { ...middle_xy, zoom }
    }

    return { x, y, zoom }
}
