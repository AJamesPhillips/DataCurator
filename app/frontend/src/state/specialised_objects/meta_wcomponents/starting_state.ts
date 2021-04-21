import type { MetaWComponentsState } from "./State"



export function get_meta_wcomponents_starting_state (): MetaWComponentsState
{
    return {
        selected_wcomponent_ids: new Set(),
        selected_wcomponent_ids_list: [],
        highlighted_wcomponent_ids: new Set(),
        last_clicked_wcomponent_id: undefined,
        intercept_wcomponent_click_to_edit_link: undefined,
        last_pointer_down_connection_terminal: undefined,
    }
}
