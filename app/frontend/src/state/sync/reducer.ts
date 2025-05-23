import type { AnyAction } from "redux"

import type { KnowledgeView } from "../../shared/interfaces/knowledge_view"
import { get_items_by_id } from "../../shared/utils/get_items"
import { set_union } from "../../utils/set"
import { update_substate } from "../../utils/update_state"
import type { WComponent } from "../../wcomponent/interfaces/SpecialisedObjects"
import { is_upsert_knowledge_view } from "../specialised_objects/knowledge_views/actions"
import {
    is_clear_from_mem_all_specialised_objects,
    is_replace_all_specialised_objects,
} from "../specialised_objects/syncing/actions"
import { is_upsert_wcomponent } from "../specialised_objects/wcomponents/actions"
import type { RootState } from "../State"
import { is_debug_refresh_all_specialised_object_ids_pending_save, is_request_searching_for_wcomponents_by_id_in_any_base, is_searched_for_wcomponents_by_id_in_any_base, is_searching_for_wcomponents_by_id_in_any_base, is_update_network_status, is_update_sync_status } from "./actions"
import type {
    LastSourceOfTruthSpecialisedObjectsById,
    SpecialisedObjectIdsPendingSave,
    SyncStateForDataType,
} from "./state"
import { update_knowledge_view_last_source_of_truth, update_wcomponent_last_source_of_truth } from "./utils"



export const sync_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_update_sync_status(action))
    {
        const { status, loading_base_id, error_message = "", attempt: retry_attempt } = action

        const sync_state_for_data_type: SyncStateForDataType =
        {
            ...state.sync[action.data_type],
            status,
            error_message,
            retry_attempt,
        }
        if (loading_base_id !== undefined) sync_state_for_data_type.loading_base_id = loading_base_id

        state = update_substate(state, "sync", action.data_type, sync_state_for_data_type)
        state = update_ready_for_fields(state)
    }


    if (is_debug_refresh_all_specialised_object_ids_pending_save(action))
    {
        const wcomponents = Object.values(state.specialised_objects.wcomponents_by_id)
        const knowledge_views = Object.values(state.specialised_objects.knowledge_views_by_id)
        const ids_pending_save = prepare_specialised_object_ids_pending_save({ wcomponents, knowledge_views })
        state = update_specialised_object_ids_pending_save(state, ids_pending_save)
    }


    if (is_clear_from_mem_all_specialised_objects(action))
    {
        state = update_specialised_object_ids_pending_save(state, { knowledge_view_ids: new Set(), wcomponent_ids: new Set()})

        const last: LastSourceOfTruthSpecialisedObjectsById = { wcomponents: {}, knowledge_views: {} }
        state = update_substate(state, "sync", "last_source_of_truth_specialised_objects_by_id", last)
        state = update_substate(state, "sync", "specialised_objects", { status: undefined, loading_base_id: undefined, error_message: "", retry_attempt: 0 })
        state = update_ready_for_fields(state)
    }


    if (is_replace_all_specialised_objects(action))
    {
        const { wcomponents, knowledge_views } = action.specialised_objects
        const ids_pending_save = prepare_specialised_object_ids_pending_save({ wcomponents, knowledge_views })
        state = update_specialised_object_ids_pending_save(state, ids_pending_save)

        const last: LastSourceOfTruthSpecialisedObjectsById = {
            wcomponents: get_items_by_id(wcomponents, "wcomponents"),
            knowledge_views: get_items_by_id(knowledge_views, "knowledge_views"),
        }
        state = update_substate(state, "sync", "last_source_of_truth_specialised_objects_by_id", last)
    }


    if (is_upsert_wcomponent(action) && action.is_source_of_truth)
    {
        state = update_wcomponent_last_source_of_truth(state, action.wcomponent)
    }


    if (is_upsert_knowledge_view(action) && action.is_source_of_truth)
    {
        state = update_knowledge_view_last_source_of_truth(state, action.knowledge_view)
    }


    if (is_update_network_status(action))
    {
        state = update_substate(state, "sync", "network_functional", action.network_functional)
        state = update_substate(state, "sync", "network_function_last_checked", action.last_checked)
    }


    if (is_request_searching_for_wcomponents_by_id_in_any_base(action))
    {
        const wcomponent_ids_to_search_for_in_any_base = new Set(state.sync.wcomponent_ids_to_search_for_in_any_base)
        const { wcomponent_ids_searching_for_in_any_base, wcomponent_ids_searched_for_in_any_base } = state.sync

        action.ids
            .filter(id =>
            {
                return !wcomponent_ids_to_search_for_in_any_base.has(id)
                    && !wcomponent_ids_searching_for_in_any_base.has(id)
                    && !wcomponent_ids_searched_for_in_any_base.has(id)
                    && !state.specialised_objects.wcomponents_by_id[id]
            })
            .forEach(id => wcomponent_ids_to_search_for_in_any_base.add(id))

        state = update_substate(state, "sync", "wcomponent_ids_to_search_for_in_any_base", wcomponent_ids_to_search_for_in_any_base)
    }


    if (is_searching_for_wcomponents_by_id_in_any_base(action))
    {
        const wcomponent_ids_searching_for_in_any_base = set_union(state.sync.wcomponent_ids_to_search_for_in_any_base, state.sync.wcomponent_ids_searching_for_in_any_base)
        state = update_substate(state, "sync", "wcomponent_ids_to_search_for_in_any_base", new Set<string>())
        state = update_substate(state, "sync", "wcomponent_ids_searching_for_in_any_base", wcomponent_ids_searching_for_in_any_base)
    }


    if (is_searched_for_wcomponents_by_id_in_any_base(action))
    {
        const wcomponent_ids_searching_for_in_any_base = new Set(state.sync.wcomponent_ids_searching_for_in_any_base)
        const wcomponent_ids_searched_for_in_any_base = new Set(state.sync.wcomponent_ids_searched_for_in_any_base)
        action.ids.forEach(id =>
        {
            wcomponent_ids_searching_for_in_any_base.delete(id)
            wcomponent_ids_searched_for_in_any_base.add(id)
        })

        state = update_substate(state, "sync", "wcomponent_ids_searching_for_in_any_base", wcomponent_ids_searching_for_in_any_base)
        state = update_substate(state, "sync", "wcomponent_ids_searched_for_in_any_base", wcomponent_ids_searched_for_in_any_base)
    }


    return state
}



function update_ready_for_fields (state: RootState): RootState
{
    const { bases, specialised_objects } = state.sync

    // const bases_ready = get_ready_for_fields_for_data_type(bases)
    const specialised_objects_ready = get_ready_for_fields_for_data_type(specialised_objects)
    state = update_substate(state, "sync", "ready_for_reading", specialised_objects_ready.ready_for_reading)
    state = update_substate(state, "sync", "ready_for_writing", specialised_objects_ready.ready_for_writing)

    return state
}


function get_ready_for_fields_for_data_type (state: SyncStateForDataType)
{
    const { status } = state

    const saved = status === "SAVED"
    const loaded = status === "LOADED"
    const failed = status === "FAILED"

    const ready_for_reading = status !== undefined && status !== "LOADING"
    const ready_for_writing = saved || loaded || failed

    return { ready_for_reading, ready_for_writing }
}



function prepare_specialised_object_ids_pending_save (args: { wcomponents: WComponent[], knowledge_views: KnowledgeView[] }): SpecialisedObjectIdsPendingSave
{
    const wcomponent_ids = new Set<string>(
        args.wcomponents.filter(item => item.needs_save).map(({ id }) => id)
    )
    const knowledge_view_ids = new Set<string>(
        args.knowledge_views.filter(item => item.needs_save).map(({ id }) => id)
    )

    return { wcomponent_ids, knowledge_view_ids }
}



function update_specialised_object_ids_pending_save (state: RootState, ids_pending_save: SpecialisedObjectIdsPendingSave)
{
    return update_substate(state, "sync", "specialised_object_ids_pending_save", ids_pending_save)
}
