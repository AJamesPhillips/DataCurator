import { get_supabase } from "../../supabase/get_supabase"
import { min_throttle } from "../../utils/throttle"
import { ACTIONS } from "../actions"
import { pub_sub } from "../pub_sub/pub_sub"
import type { StoreType } from "../store"
import { supabase_get_wcomponents_from_any_base } from "./supabase/wcomponent"
import { load_state } from "./utils/load_state"



export function sync_subscribers (store: StoreType)
{
    pub_sub.user.sub("changed_bases", () =>
    {
        const { ready_for_reading } = store.getState().sync
        // console .log ("changed_bases", ready_for_reading)
        if (ready_for_reading) return

        load_state(store)
    })
    pub_sub.user.sub("changed_chosen_base_id", () => load_state(store))

    const starting_state = store.getState()
    // We may start with a supabase user and chosen_base_id (from the synchronous restore from localstorage state)
    const { user, chosen_base_id } = starting_state.user_info
    if (user && chosen_base_id !== undefined)
    {
        // console .log ("sync, loading state as have user", user, "and chosen base id", chosen_base_id)
        load_state(store)
    }


    subscribe_search_for_requested_wcomponents_in_any_base(store)
}



function subscribe_search_for_requested_wcomponents_in_any_base (store: StoreType)
{
    const supabase = get_supabase()


    const throttled_search_for_requested_wcomponents_in_any_base = min_throttle(async () =>
    {
        const state = store.getState()

        // Defensive
        if (!state.sync.wcomponent_ids_to_search_for_in_any_base.size) return

        const ids_to_search_for = Array.from(state.sync.wcomponent_ids_to_search_for_in_any_base)

        store.dispatch(ACTIONS.sync.searching_for_wcomponents_by_id_in_any_base())

        const result = await supabase_get_wcomponents_from_any_base({ supabase, ids: ids_to_search_for })

        store.dispatch(ACTIONS.sync.searched_for_wcomponents_by_id_in_any_base({ ids: ids_to_search_for }))
        store.dispatch(ACTIONS.specialised_object.add_wcomponents_to_store({ wcomponents: result.wcomponents }))

    }, 50)


    // Could do this more efficiently with a pubsub from the reducer
    // handling `is_request_searching_for_wcomponents_by_id_in_any_base`
    // but will not as premature optimisation
    store.subscribe(async () =>
    {
        const state = store.getState()
        if (!state.sync.ready_for_reading) return
        if (state.sync.wcomponent_ids_to_search_for_in_any_base.size)
        {
            throttled_search_for_requested_wcomponents_in_any_base.throttled()
        }
    })


    pub_sub.user.sub("changed_chosen_base_id", () =>
    {
        throttled_search_for_requested_wcomponents_in_any_base.cancel()
    })
}
