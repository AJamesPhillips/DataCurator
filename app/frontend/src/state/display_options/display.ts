import type { ContentCoordinate, PositionAndZoom } from "../../canvas/interfaces"
import { h_step, round_number, v_step } from "../../canvas/position_utils"
import { SCALE_BY } from "../../canvas/zoom_utils"
// import { Certainty } from "../../shared/uncertainty/quantified_language"
import type { RootState } from "../State"
// import type { ValidityToCertainty, ValidityToCertaintyTypes, ValidityToCertainty_TypeToMap } from "./state"



// TODO move this to some dynamic measure of screen size
const half_screen_width = 1000 / 2
const half_screen_height = 600 / 2
function calculate_xy_for_middle (args: { x: number, y: number, zoom: number }): { x: number, y: number }
{
    const x = round_number(args.x + (half_screen_width * (SCALE_BY / args.zoom)), h_step)
    const y = round_number(args.y - (half_screen_height * (SCALE_BY / args.zoom)), v_step)

    return { x, y }
}

function calculate_xy_for_put_middle (args: { x: number, y: number, zoom: number }): { x: number, y: number }
{
    const x = args.x - ((half_screen_width * (SCALE_BY / args.zoom)) - (h_step / 2))
    const y = args.y + ((half_screen_height * (SCALE_BY / args.zoom)) - (v_step / 2))

    return { x, y }
}



export function get_middle_of_screen (state: RootState)
{
    const result = calculate_xy_for_middle(state.routing.args)

    return { left: result.x, top: -result.y }
}

export function lefttop_to_xy (position?: Partial<ContentCoordinate> | undefined, middle?: boolean): PositionAndZoom | undefined
export function lefttop_to_xy (position: ContentCoordinate, middle?: boolean): PositionAndZoom
export function lefttop_to_xy (position?: Partial<ContentCoordinate> | undefined, middle?: boolean): PositionAndZoom | undefined
{
    if (!position) return undefined

    const { left: x, top, zoom } = position
    const y = top !== undefined ? -1 * top : undefined

    if (middle && x !== undefined && y !== undefined && zoom !== undefined)
    {
        const middle = calculate_xy_for_put_middle({ x, y, zoom })
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
