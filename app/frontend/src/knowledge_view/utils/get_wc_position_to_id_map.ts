import { round_canvas_point } from "../../canvas/position_utils"
import type { KnowledgeViewWComponentIdEntryMap } from "../../shared/interfaces/knowledge_view"
import { WComponentsById, wcomponent_is_plain_connection } from "../../wcomponent/interfaces/SpecialisedObjects"



export function wc_map_entry_to_coord_key (entry: { left: number, top: number })
{
    return `${entry.left},${entry.top}`
}



export function get_wc_position_to_id_map (wc_id_map: KnowledgeViewWComponentIdEntryMap, wcomponents_by_id: WComponentsById)
{
    const entries: { [coord: string]: string[] } = {}

    Object.entries(wc_id_map).forEach(([wcomponent_id, entry]) =>
    {
        // Temporary check until we compute the actual location of connections as being half way between nodes
        // AND display the connection "node"
        if (wcomponent_is_plain_connection(wcomponents_by_id[wcomponent_id])) return

        const rounded_entry = round_canvas_point(entry, "large")
        const coord_key = wc_map_entry_to_coord_key(rounded_entry)
        const ids = entries[coord_key] || []
        ids.push(wcomponent_id)
        entries[coord_key] = ids
    })

    return entries
}
