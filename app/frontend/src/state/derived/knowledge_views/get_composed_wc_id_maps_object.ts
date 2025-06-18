import { KnowledgeView, KnowledgeViewWComponentIdEntryMap } from "../../../shared/interfaces/knowledge_view"
import { WComponentsById, wcomponent_is_deleted } from "../../../wcomponent/interfaces/SpecialisedObjects"



export interface ComposedWcIdMapsObject
{
    composed_wc_id_map: KnowledgeViewWComponentIdEntryMap
    composed_blocked_wc_id_map: KnowledgeViewWComponentIdEntryMap
}

export function get_composed_wc_id_maps_object (stack_of_knowledge_views: KnowledgeView[], wcomponents_by_id: WComponentsById): ComposedWcIdMapsObject
{
    let composed_wc_id_map: KnowledgeViewWComponentIdEntryMap = {}
    stack_of_knowledge_views.forEach(knowledge_view =>
    {
        Object.entries(knowledge_view.wc_id_map).forEach(([id, entry]) =>
        {
            if (entry.passthrough) return

            // ensure it is deleted first so that when (re)added it will placed last (on top)
            delete composed_wc_id_map[id]
            composed_wc_id_map[id] = entry
        })
    })

    remove_deleted_wcomponents(composed_wc_id_map, wcomponents_by_id)

    const result = partition_wc_id_map_on_blocked(composed_wc_id_map)
    composed_wc_id_map = result.composed_wc_id_map
    const composed_blocked_wc_id_map = result.composed_blocked_wc_id_map

    return { composed_wc_id_map, composed_blocked_wc_id_map }
}


function remove_deleted_wcomponents (composed_wc_id_map: KnowledgeViewWComponentIdEntryMap, wcomponents_by_id: WComponentsById)
{
    Object.keys(composed_wc_id_map).forEach(id =>
    {
        const wcomponent = wcomponents_by_id[id]
        // Have commented this line out to allow wcomponents which are not found
        // to still be kept as they may be from a different project (base) and
        // just not loaded.
        // if (!wcomponent) delete composed_wc_id_map[id]
        if (wcomponent_is_deleted(wcomponent)) delete composed_wc_id_map[id]
    })
}


function partition_wc_id_map_on_blocked (composed_wc_id_map: KnowledgeViewWComponentIdEntryMap): ComposedWcIdMapsObject
{
    const composed_blocked_wc_id_map: KnowledgeViewWComponentIdEntryMap = {}

    Object.entries(composed_wc_id_map).forEach(([wcomponent_id, entry]) =>
    {
        if (entry.blocked)
        {
            composed_blocked_wc_id_map[wcomponent_id] = entry
            delete composed_wc_id_map[wcomponent_id]
        }
    })

    return { composed_wc_id_map, composed_blocked_wc_id_map }
}
