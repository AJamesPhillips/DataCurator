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
        const { composed_wc_id_map, wc_ids_by_type } = composed_kv
        const { x, y, zoom } = state.routing.args
        const max_x = x + (screen_width() * (SCALE_BY / zoom))
        const max_y = y - (screen_height() * (SCALE_BY / zoom))

        components_on_screen = !!Array.from(wc_ids_by_type.any_node).find(id => {
            const position = composed_wc_id_map[id]

            // console.group(state.specialised_objects.wcomponents_by_id[id]?.title, position?.left, position?.top)

            if (!position) return false
            const { left, top } = position
            // console .log("left >= x", left >= x, `${left} >= ${x}`)
            // console .log("left <= max_x", left <= max_x, `${left} <= ${max_x}`)
            // console .log("-top <= y", -top <= y, `${-top} <= ${y}`)
            // console .log("-top >= max_y", -top >= max_y, `${-top} >= ${max_y}`)
            // console.groupEnd()

            return left >= x && left <= max_x && -top <= y && -top >= max_y
        })
    }

    return components_on_screen
}
