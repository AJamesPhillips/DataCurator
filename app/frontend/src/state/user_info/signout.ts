import { get_store } from "../store"
import { storage_dependent_save } from "../sync/utils/save_state"



export async function signout ()
{
    const store = get_store()
    // We should either:
    //  1. wait for all loading to finish.
    //  2. cancel any loading.
    // At the moment this will fail if state.sync.reading_for_writing is not true
    await storage_dependent_save(store.dispatch, store.getState())
}
