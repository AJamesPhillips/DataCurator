import { get_actually_display_time_sliders } from "../state/controls/accessors"
import { screen_width, screen_height } from "../state/display_options/display"
import { get_current_composed_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { SCALE_BY } from "./zoom_utils"



export function calculate_if_components_on_screen (state: RootState)
{
    let components_on_screen: boolean | undefined = undefined
    const composed_kv = get_current_composed_knowledge_view_from_state(state)

    if (composed_kv)
    {
        const { composed_visible_wc_id_map, wc_ids_by_type } = composed_kv
        const { x: min_x, y, zoom } = state.routing.args

        const scale_pixel_to_canvas = SCALE_BY / zoom

        // todo improve how these are calculated
        const side_panel_fudge = state.controls.display_side_panel ? 440 : 0
        const top_header_fudge = 48
        const bottom_controls_fudge = get_actually_display_time_sliders(state) ? 215 : 57

        const max_x = min_x + ((screen_width() - side_panel_fudge) * scale_pixel_to_canvas)
        const min_y = y - (top_header_fudge * scale_pixel_to_canvas)
        const max_y = min_y - ((screen_height() - top_header_fudge - bottom_controls_fudge) * scale_pixel_to_canvas)

        components_on_screen = !!Array.from(wc_ids_by_type.any_node).find(id => {
            const position = composed_visible_wc_id_map[id]

            // console.group(state.specialised_objects.wcomponents_by_id[id]?.title, position?.left, position?.top)

            if (!position) return false
            const { left, top } = position
            // if (id == "12345...")
            // {
            //     console .log("left >= min_x", left >= min_x, `${left} >= ${min_x}`)
            //     console .log("left <= max_x", left <= max_x, `${left} <= ${max_x}`)
            //     console .log("-top <= min_y", -top <= min_y, `${-top} <= ${min_y}`)
            //     console .log("-top >= max_y", -top >= max_y, `${-top} >= ${max_y}`)
            // }
            // console.groupEnd()

            return left >= min_x && left <= max_x && -top <= min_y && -top >= max_y
        })
    }

    return components_on_screen
}
