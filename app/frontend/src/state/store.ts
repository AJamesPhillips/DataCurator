import { createStore, Action, Store } from "redux"
import { register_window_focus_session_check } from "../sync/user_info/window_focus_session_check"

import { display_options_subscribers } from "./display_options/subscribers"
import { record_keyupdown_activity } from "./global_keys/record_keyupdown_activity"
import { persist_relevant_state } from "./persistence/persistence"
import { root_reducer } from "./reducer"
import { periodically_change_display_at_created_datetime } from "./routing/datetime/display_at_created"
import { factory_location_hash } from "./routing/factory_location_hash"
import routing_subscribers from "./routing/subscribers"
import {
    meta_wcomponents_selecting_subscribers,
} from "./specialised_objects/meta_wcomponents/selecting/subscribers"
import { specialised_objects_subscribers } from "./specialised_objects/subscribers/subscribers"
import { get_starting_state } from "./starting_state"
import type { RootState } from "./State"
import { sync_subscribers } from "./sync/subscribers"
import { conditionally_save_state } from "./sync/utils/conditionally_save_state"
import { setup_warning_of_unsaved_data_beforeunload } from "./unsaved_warning_onbeforeunload"
import { user_info_subscribers } from "./user_info/subscribers"



export type StoreType = Store<RootState, Action<any>> & { load_state_from_storage: boolean }
let cached_store: StoreType

interface ConfigStoreArgs
{
    use_cache?: boolean
    override_preloaded_state?: Partial<RootState> | undefined
    load_state_from_storage?: boolean
}
export function get_store (args: ConfigStoreArgs = {}): StoreType
{
    const {
        use_cache = true,
        override_preloaded_state = {},
        load_state_from_storage = false,
    } = args

    if (cached_store && use_cache) return cached_store


    const preloaded_state: RootState = {
        ...get_starting_state(load_state_from_storage),
        ...override_preloaded_state,
    }
    const store = createStore<RootState, Action, {}, {}>(root_reducer as any, preloaded_state) as any as StoreType
    store.load_state_from_storage = load_state_from_storage
    cached_store = store as any


    const save = () =>
    {
        const state = store.getState()
        persist_relevant_state(state)
        conditionally_save_state(store)
    }
    store.subscribe(save)


    setup_warning_of_unsaved_data_beforeunload(load_state_from_storage, store)

    store.subscribe(factory_location_hash(store))


    store.subscribe(specialised_objects_subscribers(store))
    display_options_subscribers(store)
    meta_wcomponents_selecting_subscribers(store)


    periodically_change_display_at_created_datetime(store)

    record_keyupdown_activity(store)

    routing_subscribers.sync_storage_location_subscriber(store)

    user_info_subscribers(store)

    sync_subscribers(store)

    register_window_focus_session_check(store)

    return store
}
