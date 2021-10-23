import { pub_sub } from "../pub_sub/pub_sub"
import type { StoreType } from "../store"
import { load_state } from "./utils/load_state"



export function sync_subscribers (store: StoreType)
{
    pub_sub.user.sub("changed_user", () => load_state(store))
    pub_sub.user.sub("changed_chosen_base_id", () => load_state(store))

    const starting_state = store.getState()
    // We may start with a supabase user and chosen_base_id (from the synchronous restore from localstorage state)
    const { user, chosen_base_id } = starting_state.user_info
    if (user && chosen_base_id !== undefined) load_state(store)
}
