import {
    clean_base_object_of_sync_meta_fields,
} from "../../state/sync/supabase/clean_base_object_for_supabase"
import type { KnowledgeView, KnowledgeViewWComponentIdEntryMap } from "../../shared/interfaces/knowledge_view"
import { parse_base_dates } from "./parse_dates"



export function parse_knowledge_view (knowledge_view: KnowledgeView, wcomponent_ids?: Set<string>, remove_passthrough_entries = false): KnowledgeView
{
    knowledge_view = clean_base_object_of_sync_meta_fields(knowledge_view) // defensive

    let wc_id_map = knowledge_view.wc_id_map
    // wc_id_map = optionally_remove_invalid_wc_ids(knowledge_view, false, wcomponent_ids)
    if (remove_passthrough_entries)
    {
        wc_id_map = remove_wc_id_map_passthrough_entries(wc_id_map)
    }

    knowledge_view = {
        ...knowledge_view,
        ...parse_base_dates(knowledge_view),
        wc_id_map,
        sort_type: knowledge_view.sort_type || "normal",
    }

    knowledge_view = upgrade_2021_05_24_knowledge_view(knowledge_view)
    knowledge_view = upgrade_2021_11_19_knowledge_view(knowledge_view)

    return knowledge_view
}



function optionally_remove_invalid_wc_ids (kv: KnowledgeView, remove_missing: boolean, wcomponent_ids?: Set<string>): KnowledgeViewWComponentIdEntryMap
{
    if (!wcomponent_ids) return kv.wc_id_map

    const new_wc_id_map: KnowledgeViewWComponentIdEntryMap = {}
    const missing_ids: string[] = []

    Object.entries(kv.wc_id_map).forEach(([id, value]) =>
    {
        if (remove_missing)
        {
            if (wcomponent_ids.has(id)) new_wc_id_map[id] = value
            else missing_ids.push(id)
        }
        else
        {
            new_wc_id_map[id] = value
            if (!wcomponent_ids.has(id)) missing_ids.push(id)
        }
    })


    if (missing_ids.length > 0)
    {
        // We don't want to remove them yet as some views are a hybrid of components from multiple bases
        // and we should implement the functionality to load other bases, instead of (before we) drop
        // "invalid" wcomponent ids from knowledge views
        console.warn(`${remove_missing ? "Dropped " : ""}${missing_ids.length} invalid ids in KnowledgeView: ${kv.id}`)
        console.warn(missing_ids)
    }


    return new_wc_id_map
}



function remove_wc_id_map_passthrough_entries (wc_id_map: KnowledgeViewWComponentIdEntryMap): KnowledgeViewWComponentIdEntryMap
{
    const new_wc_id_map = { ...wc_id_map }
    const deleted_ids: string[] = []

    Object.entries(new_wc_id_map).forEach(([id, entry]) =>
    {
        if (!entry.passthrough) return
        delete new_wc_id_map[id]
        deleted_ids.push(id)
    })

    // if (deleted_ids.length) console .log(`Deleted ${deleted_ids.length} passthrough ids`)

    return new_wc_id_map
}



function upgrade_2021_05_24_knowledge_view (knowledge_view: KnowledgeView): KnowledgeView
{
    // data migrate to ensure goal_ids array is always present
    // TODO remove once MVP1.0
    const goal_ids = knowledge_view.goal_ids || []
    return { ...knowledge_view, goal_ids }
}



function upgrade_2021_11_19_knowledge_view (knowledge_view: KnowledgeView): KnowledgeView
{
    const { wc_id_map } = knowledge_view
    const new_wc_id_map = { ...wc_id_map }
    Object.values(new_wc_id_map).forEach(entry =>
    {
        if ((entry as any).deleted)
        {
            delete (entry as any).deleted
            entry.blocked = true
        }
    })

    return { ...knowledge_view, wc_id_map: new_wc_id_map }
}
