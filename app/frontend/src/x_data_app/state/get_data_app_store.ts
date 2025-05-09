import { Action, createStore, Store } from "redux"

import { factory_root_reducer } from "./reducer"
import { get_starting_state } from "./starting_state"
import type { DataAppRootState } from "./State"



export type DataAppStoreType = Store<DataAppRootState, Action<any>> & { load_state_from_storage: boolean }
let cached_store: DataAppStoreType | undefined = undefined

interface ConfigStoreArgs
{
    use_cache?: boolean
    override_preloaded_state?: Partial<DataAppRootState> | undefined
    load_state_from_storage?: boolean
}
export function get_data_app_store (args: ConfigStoreArgs = {}): DataAppStoreType
{
    const {
        use_cache = true,
        override_preloaded_state = {},
        load_state_from_storage = false,
    } = args

    if (cached_store && use_cache) return cached_store


    const preloaded_state: DataAppRootState = {
        ...get_starting_state(load_state_from_storage),
        ...override_preloaded_state,
    }
    const root_reducer = factory_root_reducer(preloaded_state)
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    const store = createStore<DataAppRootState, Action, {}, {}>(root_reducer, preloaded_state) as DataAppStoreType
    store.load_state_from_storage = load_state_from_storage
    cached_store = store

    return store
}
