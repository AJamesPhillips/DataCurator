import type { MetaWComponentsState } from "./State"



export function get_meta_wcomponents_starting_state (): MetaWComponentsState
{
    return {
        selected_wcomponent_ids_list: [],
        selected_wcomponent_ids_set: new Set(),
        selected_wcomponent_ids_to_ordinal_position_map: {},

        highlighted_wcomponent_ids: new Set(),
        neighbour_ids_of_highlighted_wcomponent: new Set(),
        last_clicked_wcomponent_id: undefined,
        last_pointer_down_connection_terminal: undefined,
        wcomponent_ids_to_move_set: new Set(),

        find_all_causal_paths_from_wcomponent_ids: [],
        find_all_causal_paths_to_wcomponent_ids: [],
    }
}
