import type {
    ConnectionTerminalType,
} from "../../../wcomponent/interfaces/SpecialisedObjects"



export interface MetaWComponentsState
{
    selected_wcomponent_ids_list: string[]
    selected_wcomponent_ids_set: Set<string>
    // todo, deprecate `selected_wcomponent_ids_to_ordinal_position_map` if prototype nodes
    // by time view is removed
    selected_wcomponent_ids_to_ordinal_position_map: { [id: string]: number }

    highlighted_wcomponent_ids: Set<string>
    neighbour_ids_of_highlighted_wcomponent: Set<string>
    last_clicked_wcomponent_id: string | undefined
    last_pointer_down_connection_terminal: { wcomponent_id: string, terminal_type: ConnectionTerminalType | undefined } | undefined
    wcomponent_ids_to_move_set: Set<string>
    frame_is_resizing: boolean

    find_all_causal_paths_from_wcomponent_ids: string[]
    find_all_causal_paths_to_wcomponent_ids: string[]
}
