import type {
    ConnectionLocationType,
    ConnectionTerminalType,
} from "../../../shared/wcomponent/interfaces/SpecialisedObjects"



export interface MetaWComponentsState
{
    selected_wcomponent_ids: Set<string>
    selected_wcomponent_ids_list: string[]
    highlighted_wcomponent_ids: Set<string>
    last_clicked_wcomponent_id: string | undefined
    last_pointer_down_connection_terminal: { wcomponent_id: string, connection_location: ConnectionLocationType } | undefined
}
