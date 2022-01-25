import { pub_sub } from "../pub_sub/pub_sub"
import type { StoreType } from "../store"
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
}
