import { ConnectionTerminus } from "../../canvas/connections/terminal"
import { KnowledgeViewWComponentIdEntryMap } from "../../shared/interfaces/knowledge_view"
import { ComposedKnowledgeView } from "../../state/derived/State"
import {
    ConnectionTerminalType,
    WComponent,
    WComponentConnection
} from "../../wcomponent/interfaces/SpecialisedObjects"


export interface GetConnectionTerminiArgs
{
    wcomponent: WComponentConnection
    from_wc?: WComponent
    to_wc?: WComponent
    current_composed_knowledge_view: ComposedKnowledgeView
}

export function get_connection_termini (args: GetConnectionTerminiArgs)
{
    const { wcomponent, current_composed_knowledge_view, from_wc, to_wc } = args

    const {
        kv_entry_from_wc, kv_entry_to_wc, from_attribute, to_attribute
    } = get_connection_terminal_node_positions({ wcomponent, wc_id_map: current_composed_knowledge_view.composed_wc_id_map })


    const from_connection_terminal_type: ConnectionTerminalType = { side: "right", attribute: from_attribute }
    const to_connection_terminal_type: ConnectionTerminalType = { side: "left", attribute: to_attribute }


    const from_wcomponent_type = from_wc?.type
    const to_wcomponent_type = to_wc?.type

    const connection_from_component: ConnectionTerminus | undefined = kv_entry_from_wc && from_wcomponent_type && {
        kv_wc_entry: kv_entry_from_wc,
        wcomponent_type: from_wcomponent_type,
        connection_terminal_type: from_connection_terminal_type,
    }

    const connection_to_component: ConnectionTerminus | undefined = kv_entry_to_wc && to_wcomponent_type && {
        kv_wc_entry: kv_entry_to_wc,
        wcomponent_type: to_wcomponent_type,
        connection_terminal_type: to_connection_terminal_type,
    }

    return { connection_from_component, connection_to_component }
}


interface GetConnectionTerminalNodePositionsArgs
{
    wcomponent: WComponentConnection
    wc_id_map: KnowledgeViewWComponentIdEntryMap
}
function get_connection_terminal_node_positions ({ wcomponent, wc_id_map }: GetConnectionTerminalNodePositionsArgs)
{
    const kv_entry_from_wc = wc_id_map[wcomponent.from_id]
    const kv_entry_to_wc = wc_id_map[wcomponent.to_id]
    const from_attribute = wcomponent.from_type
    const to_attribute = wcomponent.to_type

    return { kv_entry_from_wc, kv_entry_to_wc, from_attribute, to_attribute }
}
