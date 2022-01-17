import type { AnyAction } from "redux"

import { round_canvas_point } from "../../../../canvas/position_utils"
import type {
    KnowledgeViewWComponentIdEntryMap,
    KnowledgeView,
    KnowledgeViewWComponentEntry,
} from "../../../../shared/interfaces/knowledge_view"
import type { RootState } from "../../../State"
import {
    get_current_knowledge_view_from_state,
    get_current_composed_knowledge_view_from_state,
} from "../../accessors"
import { handle_upsert_knowledge_view } from "../utils"
import {
    ActionBulkAddToKnowledgeView,
    ActionBulkEditKnowledgeViewEntries,
    ActionBulkRemoveFromKnowledgeView,
    ActionMoveCurrentKnowledgeViewEntriesToTop,
    ActionSnapToGridKnowledgeViewEntries,
    is_bulk_add_to_knowledge_view,
    is_bulk_edit_knowledge_view_entries,
    is_bulk_remove_from_knowledge_view,
    is_move_current_knowledge_view_entries_to_top,
    is_snap_to_grid_knowledge_view_entries,
} from "./actions"



export const bulk_editing_knowledge_view_entries_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_bulk_edit_knowledge_view_entries(action))
    {
        state = handle_bulk_edit_knowledge_view_entries(state, action)
    }


    if (is_snap_to_grid_knowledge_view_entries(action))
    {
        state = handle_snap_to_grid_knowledge_view_entries(state, action)
    }


    if (is_move_current_knowledge_view_entries_to_top(action))
    {
        state = handle_move_current_knowledge_view_entries_to_top(state, action)
    }


    if (is_bulk_add_to_knowledge_view(action))
    {
        state = handle_bulk_add_to_knowledge_view(state, action)
    }


    if (is_bulk_remove_from_knowledge_view(action))
    {
        state = handle_bulk_remove_from_knowledge_view(state, action)
    }


    return state
}



function handle_bulk_add_to_knowledge_view (state: RootState, action: ActionBulkAddToKnowledgeView)
{
    const { knowledge_view_id, wcomponent_ids } = action

    const kv = state.specialised_objects.knowledge_views_by_id[knowledge_view_id]
    const composed_kv = get_current_composed_knowledge_view_from_state(state)


    if (!kv)
    {
        console.error(`Could not find knowledge view for bulk_add_to_knowledge_view by id: "${knowledge_view_id}"`)
    }
    else if (!composed_kv)
    {
        console.error("There should always be a current knowledge view if bulk editing position of world components")
    }
    else
    {
        let new_wc_id_map: KnowledgeViewWComponentIdEntryMap = {}


        wcomponent_ids.forEach(id => {
            const entry = composed_kv.composed_wc_id_map[id]
            if (!entry) {
                console.error(`we should always have an entry but wcomponent "${id}" lacking entry in composed_kv composed_wc_id_map for "${knowledge_view_id}"`)
                return
            }

            entry.blocked = undefined
            entry.passthrough = undefined

            // if (entry.blocked || entry.passthrough)
            // {
            //     console.warn(`we should not be adding an entry for wcomponent "${id}" in composed_kv composed_wc_id_map for "${knowledge_view_id}" as it is blocked or passed through`)
            //     return
            // }

            new_wc_id_map[id] = entry
        })

        new_wc_id_map = { ...new_wc_id_map, ...kv.wc_id_map }


        const new_kv: KnowledgeView = { ...kv, wc_id_map: new_wc_id_map }
        state = handle_upsert_knowledge_view(state, new_kv)
    }

    return state
}



function handle_bulk_remove_from_knowledge_view (state: RootState, action: ActionBulkRemoveFromKnowledgeView)
{
    const { wcomponent_ids, remove_type } = action
    const blocked = remove_type === "block"

    const kv = get_current_knowledge_view_from_state(state)
    const composed_kv = get_current_composed_knowledge_view_from_state(state)

    if (!kv || !composed_kv)
    {
        console.error("There should always be a current and current composed knowledge view if bulk editing (removing) positions of world components")
    }
    else
    {
        const new_wc_id_map: KnowledgeViewWComponentIdEntryMap = { ...kv.wc_id_map }

        wcomponent_ids.forEach(id =>
        {
            const entry = blocked ? composed_kv.composed_wc_id_map[id] : kv.wc_id_map[id]
            if (!entry) return

            const new_entry: KnowledgeViewWComponentEntry = blocked
                ? { ...entry, blocked: true, passthrough: undefined }
                : { ...entry, blocked: undefined, passthrough: true }

            new_wc_id_map[id] = new_entry
        })

        const new_kv: KnowledgeView = { ...kv, wc_id_map: new_wc_id_map }
        state = handle_upsert_knowledge_view(state, new_kv)
    }

    return state
}



function handle_snap_to_grid_knowledge_view_entries (state: RootState, action: ActionSnapToGridKnowledgeViewEntries)
{
    const { wcomponent_ids, knowledge_view_id } = action
    const kv = state.specialised_objects.knowledge_views_by_id[knowledge_view_id]

    if (kv)
    {
        const new_wc_id_map = { ...kv.wc_id_map }

        wcomponent_ids.forEach(wcomponent_id =>
        {
            const entry = kv.wc_id_map[wcomponent_id]
            if (!entry) return // possible todo: go through foundational kvs and move them to grid

            const new_entry = round_canvas_point(entry, "large")
            new_wc_id_map[wcomponent_id] = new_entry
        })

        const new_kv: KnowledgeView = { ...kv, wc_id_map: new_wc_id_map }
        state = handle_upsert_knowledge_view(state, new_kv)
    }

    return state
}



function handle_move_current_knowledge_view_entries_to_top (state: RootState, action: ActionMoveCurrentKnowledgeViewEntriesToTop)
{
    const { wcomponent_ids } = action

    const kv = get_current_knowledge_view_from_state(state)
    const composed_kv = get_current_composed_knowledge_view_from_state(state)
    if (!kv || !composed_kv)
    {
        console.error("There should always be a current and current composed knowledge view if bulk editing (moving to top) world components")
    }
    else
    {
        const new_wc_id_map = { ...kv.wc_id_map }

        wcomponent_ids.forEach(wcomponent_id =>
        {
            const existing_entry = composed_kv.composed_wc_id_map[wcomponent_id]
            if (!existing_entry) return // error

            delete new_wc_id_map[wcomponent_id]
            new_wc_id_map[wcomponent_id] = existing_entry
        })

        const new_kv: KnowledgeView = { ...kv, wc_id_map: new_wc_id_map }
        state = handle_upsert_knowledge_view(state, new_kv)
    }

    return state
}



function handle_bulk_edit_knowledge_view_entries (state: RootState, action: ActionBulkEditKnowledgeViewEntries)
{
    const { wcomponent_ids, change_left, change_top } = action

    const kv = get_current_knowledge_view_from_state(state)
    const composed_kv = get_current_composed_knowledge_view_from_state(state)
    if (kv && composed_kv)
    {
        const new_wc_id_map = { ...kv.wc_id_map }

        wcomponent_ids.forEach(id => {
            const existing_entry = composed_kv.composed_wc_id_map[id]!

            const new_entry = { ...existing_entry }

            new_entry.left += change_left
            new_entry.top += change_top

            new_wc_id_map[id] = new_entry
        })

        const new_kv: KnowledgeView = { ...kv, wc_id_map: new_wc_id_map }

        state = handle_upsert_knowledge_view(state, new_kv)
    }
    else
    {
        console.error("There should always be a current knowledge view if bulk editing position of world components")
    }

    return state
}
