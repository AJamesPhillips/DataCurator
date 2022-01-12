import { v_step } from "../../canvas/position_utils"
import type { KnowledgeViewWComponentEntry, KnowledgeViewWComponentIdEntryMap } from "../../shared/interfaces/knowledge_view"
import type { WComponentsById } from "../../wcomponent/interfaces/SpecialisedObjects"
import { get_wc_position_to_id_map, wc_map_entry_to_coord_key } from "./get_wc_position_to_id_map"



export function get_next_available_wc_map_position (wc_id_map: KnowledgeViewWComponentIdEntryMap | undefined, wcomponent_id: string | undefined, wcomponents_by_id: WComponentsById, direction_y = v_step)
{
    if (!wc_id_map || !wcomponent_id) return undefined

    const entry = wc_id_map[wcomponent_id]
    if (!entry) return undefined


    const coord_to_id_map = get_wc_position_to_id_map(wc_id_map, wcomponents_by_id)


    let conflict: KnowledgeViewWComponentEntry | undefined = entry
    const next_available: KnowledgeViewWComponentEntry = { left: entry.left, top: entry.top }

    while (conflict)
    {
        next_available.top += direction_y // this will try to find a location further down the screen
        const coord_key = wc_map_entry_to_coord_key(next_available)
        const conflicting_ids = coord_to_id_map[coord_key] || []
        const conflicting_id = conflicting_ids[0]
        conflict = conflicting_id ? wc_id_map[conflicting_id] : undefined
    }


    return next_available
}
