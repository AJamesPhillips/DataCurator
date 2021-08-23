import { createStore, Action, Store } from "redux"

import { display_options_subscribers } from "./display_options/subscribers"
import { record_keyupdown_activity } from "./global_keys/record_keyupdown_activity"
import { render_all_objects, render_all_objects_and_update_store } from "./objects/rendering"
import { root_reducer } from "./reducer"
import { periodically_change_display_at_created_datetime } from "./routing/datetime/display_at_created"
import { factory_location_hash } from "./routing/factory_location_hash"
import { conditional_ctrl_f_search } from "./search/conditional_ctrl_f_search"
import { meta_wcomponents_selecting_subscribers } from "./specialised_objects/meta_wcomponents/selecting/subscribers"
import { specialised_objects_subscribers } from "./specialised_objects/subscribers/subscribers"
import { get_starting_state } from "./starting_state"
import type { RootState } from "./State"
import { periodically_backup_solid_data } from "./sync/backup/periodically_backup_solid_data"
import { optionally_copy_then_load_data } from "./sync/utils/optionally_copy_then_load_data"
import { conditionally_save_state, conditional_ctrl_s_save } from "./sync/utils/save_state"
import { persist_all_state } from "./persistence/persistence"



let cached_store: Store<RootState, Action<any>>

interface ConfigStoreArgs
{
    use_cache?: boolean
    override_preloaded_state?: Partial<RootState> | undefined
    load_state_from_storage?: boolean
}
export function get_store (args: ConfigStoreArgs = {})
{
    const {
        use_cache = true,
        override_preloaded_state = {},
        load_state_from_storage = false,
    } = args

    if (cached_store && use_cache) return cached_store


    const preloaded_state: RootState = render_all_objects({
        ...get_starting_state(),
        ...override_preloaded_state,
    })
    const store = createStore<RootState, Action, {}, {}>(root_reducer as any, preloaded_state)
    cached_store = store


    if (load_state_from_storage)
    {
        optionally_copy_then_load_data(store)
    }


    const save = () =>
    {
        const state = store.getState()
        persist_all_state(state)
        ;(window as any).debug_state = state

        conditionally_save_state(load_state_from_storage, store.dispatch, state)
        conditional_ctrl_s_save(load_state_from_storage, store.dispatch, state)
    }
    store.subscribe(save)
    window.onbeforeunload = save


    store.subscribe(render_all_objects_and_update_store(store))

    store.subscribe(factory_location_hash(store))


    store.subscribe(specialised_objects_subscribers(store))
    display_options_subscribers(store)
    meta_wcomponents_selecting_subscribers(store)


    periodically_change_display_at_created_datetime(store)

    record_keyupdown_activity(store)

    periodically_backup_solid_data(store)

    conditional_ctrl_f_search(store)

    return store
}
