import { grid_small_step, round_coordinate } from "../../canvas/position_utils"
import type { RootState } from "../State"



export function get_middle_of_screen (state: RootState)
{
    const result = calculate_xy_for_middle(state.routing.args)

    return { left: result.x, top: -result.y }
}

const half_screen_width = 1000 / 2
const half_screen_height = 600 / 2
export const h_step = grid_small_step * 18
export const v_step = 100
function calculate_xy_for_middle (args: { x: number, y: number, zoom: number }): { x: number, y: number }
{
    const x = round_coordinate(args.x + (half_screen_width * (100 / args.zoom)), h_step)
    const y = round_coordinate(args.y - (half_screen_height * (100 / args.zoom)), v_step)

    return { x, y }
}

export function calculate_xy_for_put_middle (args: { x: number, y: number, zoom: number }): { x: number, y: number }
{
    const x = args.x - ((half_screen_width * (100 / args.zoom)) - (h_step / 2))
    const y = args.y + ((half_screen_height * (100 / args.zoom)) - (v_step / 2))

    return { x, y }
}
