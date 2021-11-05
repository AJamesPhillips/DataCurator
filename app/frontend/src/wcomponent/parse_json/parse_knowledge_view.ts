import {
    clean_base_object_of_sync_meta_fields,
} from "../../state/sync/supabase/clean_base_object_for_supabase"
import type { KnowledgeView, KnowledgeViewWComponentIdEntryMap } from "../../shared/interfaces/knowledge_view"
import { parse_base_dates } from "./parse_dates"



export function parse_knowledge_view (knowledge_view: KnowledgeView, wcomponent_ids?: Set<string>): KnowledgeView
{
    knowledge_view = clean_base_object_of_sync_meta_fields(knowledge_view) // defensive

    knowledge_view = {
        ...knowledge_view,
        ...parse_base_dates(knowledge_view),
        wc_id_map: optionally_remove_invalid_wc_ids(knowledge_view, false, wcomponent_ids),
        sort_type: knowledge_view.sort_type || "normal",
    }

    return upgrade_2021_05_24_knowledge_view(knowledge_view)
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
        console.warn(`${remove_missing ? "Dropped " : ""}${missing_ids.length} invalid ids in KnowledgeView: ${kv.id}`)
        console.warn(missing_ids)
    }


    return new_wc_id_map
}



function upgrade_2021_05_24_knowledge_view (knowledge_view: KnowledgeView): KnowledgeView
{
    // data migrate to ensure goal_ids array is always present
    // TODO remove once MVP1.0
    const goal_ids = knowledge_view.goal_ids || []
    return { ...knowledge_view, goal_ids }
}
