import { get_store } from "../store"
import { conditionally_save_state } from "../sync/utils/conditionally_save_state"



export async function signout ()
{
    const store = get_store()
    const load_state_from_storage = store.load_state_from_storage
    // We should either:
    //  1. wait for all loading to finish.
    //  2. cancel any loading.
    // At the moment this will not run if state.sync.reading_for_writing is not true

    await conditionally_save_state(load_state_from_storage, store.dispatch, store.getState())
}
