import { ACTIONS } from "../actions"
import { get_store } from "../store"
import { storage_dependent_save } from "../sync/utils/save_state"



export async function signout ()
{
    const store = get_store()

    store.dispatch(ACTIONS.sync.set_next_sync_ms({ next_save_ms: undefined }))
    await storage_dependent_save(store.dispatch, store.getState())

}
