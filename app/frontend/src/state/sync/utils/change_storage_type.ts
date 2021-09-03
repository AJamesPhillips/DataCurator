import { getDefaultSession } from "@inrupt/solid-client-authn-browser"

import { ACTIONS } from "../../actions"
import { get_store } from "../../store"
import type { StorageType } from "../state"
import { optionally_copy_then_load_data } from "./optionally_copy_then_load_data"
import { throttled_save_state } from "./save_state"



interface ChangeStorageTypeArgs
{
    new_storage_type: StorageType
    copy_from: StorageType | false
}
export async function change_storage_type ({ new_storage_type, copy_from }: ChangeStorageTypeArgs)
{
    const store = get_store()

    const promise_flush = throttled_save_state.flush()
    store.dispatch(ACTIONS.sync.set_next_sync_ms({ next_save_ms: undefined }))

    if (promise_flush) await promise_flush

    // Set to LOADING so that the sync.ready is false and the save function is not triggered
    // mid way through `optionally_copy_then_load_data` that would then delete all the data
    // present in the new_storage_type location, because the state has been changed by
    // `clear_from_mem_all_specialised_objects`
    store.dispatch(ACTIONS.sync.update_sync_status({ status: "LOADING" }))
    store.dispatch(ACTIONS.specialised_object.clear_from_mem_all_specialised_objects())
    store.dispatch(ACTIONS.sync.update_storage_type({ storage_type: new_storage_type, copy_from }))

    if (new_storage_type === "solid" && !getDefaultSession().info.isLoggedIn)
    {
        // Return early as the whole page should now reload, login the user and then
        // hit the same `optionally_copy_then_load_data` in the store initialisation.
        return
    }

    optionally_copy_then_load_data(store)
}
