import { KnowledgeView, KnowledgeViewWComponentIdEntryMap } from "../../shared/interfaces/knowledge_view"
import { ComposedWcIdMapsObject } from "../../state/derived/knowledge_views/get_composed_wc_id_maps_object"



export type WComponentStatusInKnowledgeView =
{
    // 1a.  If it is not present, then we can add it
    // 2a.  If it is present, then we can delete (passthrough it)
    // 3.   If it is present, and has 1+ foundation views (and foundations contain it and it is not blocked in foundations), then we can block it here
    // 1b.  If it is passthrough, then we can (re)add it
    // 1c.  If it is blocked, then we can _readd_ it
    // 2b.  If it is blocked, then we can delete it (passthrough it)


    show_wcomponent_status_in_this_kv_section: boolean
    wcomponent_status_in_this_kv_text?: string

    show_add_button: boolean
    add_button_text?: string

    show_remove_button: boolean
    remove_button_text?: string
    remove_button_tooltip?: string

    show_remove_and_block_button: boolean
    remove_and_block_button_text?: string
    remove_and_block_button_tooltip?: string
}



export function get_wcomponent_status_in_knowledge_view (editing_allowed: boolean, wcomponent_id: string, knowledge_view: KnowledgeView, composed_wc_id_maps_object: ComposedWcIdMapsObject): WComponentStatusInKnowledgeView
{
    const result: WComponentStatusInKnowledgeView = {
        show_wcomponent_status_in_this_kv_section: false,
        show_add_button: false,
        show_remove_button: false,
        show_remove_and_block_button: false,
    }


    const knowledge_view_entry = knowledge_view.wc_id_map[wcomponent_id]
    const composed_knowledge_view_entry = composed_wc_id_maps_object.composed_wc_id_map[wcomponent_id]

    const not_present = !!(!knowledge_view_entry || knowledge_view_entry.blocked || knowledge_view_entry.passthrough)

    result.show_wcomponent_status_in_this_kv_section = !!(knowledge_view.id && not_present)
    if (result.show_wcomponent_status_in_this_kv_section)
    {
        result.wcomponent_status_in_this_kv_text = (
            ((knowledge_view_entry?.blocked ? "Deleted from" : "Not present in") + " this knowledge view")
            + ((composed_knowledge_view_entry && !composed_knowledge_view_entry.blocked) ? " but is present in a foundational knowledge view" : ""))
    }

    result.show_add_button = result.show_wcomponent_status_in_this_kv_section && editing_allowed
    if (result.show_add_button)
    {
        result.add_button_text = (knowledge_view_entry?.blocked ? "Re-add" : "Add") + " to current knowledge view"
    }

    result.show_remove_button = !!(editing_allowed && knowledge_view_entry && !knowledge_view_entry.passthrough)
    if (result.show_remove_button)
    {
        result.remove_button_text = "Remove from knowledge view"
        result.remove_button_tooltip = "Remove from current knowledge view (" + knowledge_view.title + ")"
    }

    result.show_remove_and_block_button = !!(editing_allowed && knowledge_view_entry && !knowledge_view_entry.blocked && !knowledge_view_entry.passthrough)
    if (result.show_remove_and_block_button)
    {
        result.remove_and_block_button_text = "Remove and Block from knowledge view"
        result.remove_and_block_button_tooltip = "Remove and Block from showing in current knowledge view (" + knowledge_view.title + ")"
    }

    // if (!knowledge_view_entry)
    // {
    //     show_remove_and_block_button = false // true if there's a foundation containing it?
    // }

    return result
}
