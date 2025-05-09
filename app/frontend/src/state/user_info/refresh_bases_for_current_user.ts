import type { Store } from "redux"

import { get_all_bases } from "../../supabase/bases"
import { ACTIONS } from "../actions"
import type { RootState } from "../State"
import { get_store } from "../store"
import type { SYNC_STATUS } from "../sync/state"



export async function refresh_bases_for_current_user (store?: Store<RootState>, full_reload_required = false)
{
    //debugger
    if (!store) store = get_store()

    if (full_reload_required) store.dispatch(ACTIONS.user_info.update_bases({ bases: undefined }))


    const { user } = store.getState().user_info

    store.dispatch(ACTIONS.sync.update_sync_status({ status: "LOADING", data_type: "bases" }))
    const { data, error } = await get_all_bases(user?.id)

    store.dispatch(ACTIONS.user_info.update_bases({ bases: data }))
    const status: SYNC_STATUS = error ? "FAILED" : "LOADED"
    store.dispatch(ACTIONS.sync.update_sync_status({ status, data_type: "bases" }))

    return { error: error || undefined }
}
