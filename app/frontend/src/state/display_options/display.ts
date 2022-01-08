import type { ContentCoordinate, PositionAndZoom } from "../../canvas/interfaces"
import { h_step, position_to_point, round_number, v_step } from "../../canvas/position_utils"
import { SCALE_BY } from "../../canvas/zoom_utils"
import { STARTING_ZOOM } from "../routing/starting_state"
// import { Certainty } from "../../shared/uncertainty/quantified_language"
import type { RootState } from "../State"
// import type { ValidityToCertainty, ValidityToCertaintyTypes, ValidityToCertainty_TypeToMap } from "./state"



// todo improve how these are calculated
export const TOP_HEADER_FUDGE = 48
const bottom_controls_fudge = (display_time_sliders: boolean) => display_time_sliders ? 215 : 57
const side_panel_fudge = (display_side_panel: boolean) => display_side_panel ? 440 : 0

export const get_screen_width = (display_side_panel: boolean) => document.body.clientWidth - side_panel_fudge(display_side_panel)
const get_screen_height = () => document.body.clientHeight
export const get_visible_screen_height = (display_time_sliders: boolean) => get_screen_height() - TOP_HEADER_FUDGE - bottom_controls_fudge(display_time_sliders)

const half_screen_width = (display_side_panel: boolean) => get_screen_width(display_side_panel) / 2
const half_screen_height = () => get_screen_height() / 2
function calculate_xy_for_middle (args: { x: number, y: number, zoom: number }, display_side_panel: boolean): { x: number, y: number }
{
    const x = round_number(args.x + (half_screen_width(display_side_panel) * (SCALE_BY / args.zoom)), h_step)
    const y = round_number(args.y - (half_screen_height() * (SCALE_BY / args.zoom)), v_step)

    return { x, y }
}

function calculate_xy_for_put_middle (args: { x: number, y: number, zoom: number }, display_side_panel: boolean): { x: number, y: number }
{
    const x = args.x - ((half_screen_width(display_side_panel) * (SCALE_BY / args.zoom)) - (h_step / 2))
    const y = args.y + ((half_screen_height() * (SCALE_BY / args.zoom)) - (v_step / 2))

    return { x, y }
}



export function get_middle_of_screen (state: RootState)
{
    const result = calculate_xy_for_middle(state.routing.args, state.controls.display_side_panel)

    return position_to_point(result)
}


// Give some left/top component position, calculate the x/y for the canvas routing args to move
// the canvas to the component's position.  If `middle` is `false` then the component will be in the top
// left of the screen.  If `middle` is `true` then when the canvas updates and moves, then the component
// should be presented in the middle of the screen.
export function lefttop_to_xy (position: ContentCoordinate, middle?: boolean): PositionAndZoom
export function lefttop_to_xy (position?: Partial<ContentCoordinate> | undefined, middle?: boolean): PositionAndZoom | undefined
export function lefttop_to_xy (position?: Partial<ContentCoordinate> | undefined, middle?: boolean): PositionAndZoom | undefined
{
    if (!position) return undefined

    const { left: x, top, zoom = STARTING_ZOOM } = position
    const y = top !== undefined ? -1 * top : undefined

    if (middle && x !== undefined && y !== undefined)
    {
        const middle = calculate_xy_for_put_middle({ x, y, zoom }, false)
        return { ...middle, zoom }
    }

    return { x, y, zoom }
}




// export function get_validity_filter_map (validity_filter_type: ValidityToCertaintyTypes)
// {
//     return validity_filter_type_to_map[validity_filter_type]
// }

// const show_invalid: ValidityToCertainty = {
//     [Certainty.yes]: { display: true, opacity: 1 },
//     [Certainty.likely]: { display: true, opacity: 0.7 },
//     [Certainty.maybe]: { display: true, opacity: 0.4 },
//     [Certainty.unlikely]: { display: true, opacity: 0.1 },
//     [Certainty.no]: { display: true, opacity: 0.1 },
// }

// const hide_invalid: ValidityToCertainty = {
//     ...show_invalid,
//     [Certainty.no]: { display: false, opacity: 0 },
// }

// const validity_filter_type_to_map: ValidityToCertainty_TypeToMap = {
//     show_invalid,
//     hide_invalid,
// }
