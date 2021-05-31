import type { Store } from "redux"

import { grid_small_step, round_coordinate } from "../../canvas/position_utils"
import { ACTIONS } from "../actions"
import type { RootState } from "../State"



export function toggle_consumption_formatting_on_key_press (store: Store<RootState>)
{
    return () =>
    {
        const state = store.getState()

        const key_pattern_for_toggle = state.global_keys.keys_down.has("Control") && state.global_keys.keys_down.has("e")
        if (!key_pattern_for_toggle) return

        const { last_key_time_stamp } = state.global_keys
        if (!last_key_time_stamp) return

        const { last_toggle_consumption_formatting_time_stamp = 0 } = state.display
        const have_already_toggled = last_toggle_consumption_formatting_time_stamp >= last_key_time_stamp
        if (have_already_toggled) return

        store.dispatch(ACTIONS.display.toggle_consumption_formatting({
            time_stamp: performance.now(),
        }))
    }
}



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
