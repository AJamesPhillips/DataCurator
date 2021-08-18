import type { Store } from "redux"

import type { RootState } from "../../State"
import { load_state } from "./load_state"
import { swap_storage_type } from "./swap_storage"



export function optionally_copy_then_load_data (store: Store<RootState>)
{
    swap_storage_type(store.dispatch, store.getState())
    .then(() => load_state(store.dispatch, store.getState()))
}
