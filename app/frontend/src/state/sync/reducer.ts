import type { AnyAction } from "redux"

import type { KnowledgeView } from "../../shared/interfaces/knowledge_view"
import { get_items_by_id } from "../../shared/utils/get_items"
import type { WComponent } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import { update_substate } from "../../utils/update_state"
import { is_upsert_knowledge_view } from "../specialised_objects/knowledge_views/actions"
import {
    is_clear_from_mem_all_specialised_objects,
    is_replace_all_specialised_objects,
} from "../specialised_objects/syncing/actions"
import { is_upsert_wcomponent } from "../specialised_objects/wcomponents/actions"
import type { RootState } from "../State"
import { is_update_sync_status, is_debug_refresh_all_specialised_object_ids_pending_save } from "./actions"
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
        const { status, error_message = "", attempt: retry_attempt } = action

        const sync_state_for_data_type: SyncStateForDataType =
        {
            ...state.sync[action.data_type],
            status,
            error_message,
            retry_attempt,
        }

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


    if (is_upsert_wcomponent(action) && action.source_of_truth)
    {
        state = update_wcomponent_last_source_of_truth(state, action.wcomponent)
    }


    if (is_upsert_knowledge_view(action) && action.source_of_truth)
    {
        state = update_knowledge_view_last_source_of_truth(state, action.knowledge_view)
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
        args.wcomponents.filter(wc => wc.needs_save).map(({ id }) => id)
    )
    const knowledge_view_ids = new Set<string>(
        args.knowledge_views.filter(wc => wc.needs_save).map(({ id }) => id)
    )

    return { wcomponent_ids, knowledge_view_ids }
}



function update_specialised_object_ids_pending_save (state: RootState, ids_pending_save: SpecialisedObjectIdsPendingSave)
{
    return update_substate(state, "sync", "specialised_object_ids_pending_save", ids_pending_save)
}
