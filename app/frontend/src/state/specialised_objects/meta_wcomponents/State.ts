import type {
    ConnectionTerminalType,
} from "../../../wcomponent/interfaces/SpecialisedObjects"



export interface MetaWComponentsState
{
    selected_wcomponent_ids_list: string[]
    selected_wcomponent_ids_set: Set<string>
    selected_wcomponent_ids_map: { [id: string]: number }
    highlighted_wcomponent_ids: Set<string>
    last_clicked_wcomponent_id: string | undefined
    last_pointer_down_connection_terminal: { wcomponent_id: string, terminal_type: ConnectionTerminalType } | undefined
    wcomponent_ids_to_move_list: string[]
    wcomponent_ids_to_move_set: Set<string>
}
