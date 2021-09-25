import type { Store } from "redux"

import { get_all_bases } from "../../supabase/bases"
import { ACTIONS } from "../actions"
import type { RootState } from "../State"
import { get_store } from "../store"
import type { SYNC_STATUS } from "../sync/state"



export async function refresh_bases_for_current_user (store?: Store<RootState>)
{
    if (!store) store = get_store()

    const { user } = store.getState().user_info

    if (!user)
    {
        store.dispatch(ACTIONS.user_info.update_bases({ bases: undefined }))
        return { error: undefined }
    }


    store.dispatch(ACTIONS.sync.update_sync_status({ status: "LOADING", data_type: "bases" }))
    const { data, error } = await get_all_bases()

    store.dispatch(ACTIONS.user_info.update_bases({ bases: data }))
    const status: SYNC_STATUS = error ? "FAILED" : "LOADED"
    store.dispatch(ACTIONS.sync.update_sync_status({ status, data_type: "bases" }))

    return { error: error || undefined }
}
