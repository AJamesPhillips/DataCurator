import type { KnowledgeView, KnowledgeViewWComponentIdEntryMap } from "../../shared/interfaces/knowledge_view"
import {
    clean_base_object_of_sync_meta_fields,
} from "../../state/sync/supabase/clean_base_object_for_supabase"
import { parse_base_dates } from "./parse_dates"



export function parse_knowledge_view (knowledge_view: KnowledgeView, wcomponent_ids?: Set<string>, remove_passthrough_entries = false): KnowledgeView
{
    knowledge_view = clean_base_object_of_sync_meta_fields(knowledge_view) // defensive

    let wc_id_map = knowledge_view.wc_id_map
    if (remove_passthrough_entries)
    {
        wc_id_map = remove_wc_id_map_passthrough_entries(wc_id_map)
    }

    knowledge_view = {
        ...knowledge_view,
        ...parse_base_dates(knowledge_view),
        wc_id_map,
        // TODO: document why and when `knowledge_view.sort_type` might be undefined
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        sort_type: knowledge_view.sort_type || "normal",
    }

    knowledge_view = upgrade_2021_11_19_knowledge_view(knowledge_view)

    return knowledge_view
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

    return new_wc_id_map
}


function upgrade_2021_11_19_knowledge_view (knowledge_view: KnowledgeView): KnowledgeView
{
    const { wc_id_map } = knowledge_view
    const new_wc_id_map = { ...wc_id_map }
    Object.values(new_wc_id_map).forEach(entry =>
    {
        // `entry.blocked` used to be referred to as `entry.deleted`.  This code
        // migrates the old data schema to the new schema.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if ((entry as any).deleted)
        {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            delete (entry as any).deleted
            entry.blocked = true
        }
    })

    return { ...knowledge_view, wc_id_map: new_wc_id_map }
}
