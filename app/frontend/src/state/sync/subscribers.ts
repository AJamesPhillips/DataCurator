import type { Store } from "redux"

import { pub_sub } from "../pub_sub/pub_sub"
import type { RootState } from "../State"
import { load_state } from "./utils/load_state"



export function sync_subscribers (store: Store<RootState>)
{
    pub_sub.user.sub("changed_user", () => load_state(store))
    pub_sub.user.sub("changed_chosen_base_id", () => load_state(store))

    const starting_state = store.getState()
    // We may start with a supabase user and chosen_base_id (from the synchronous restore from localstorage state)
    const { user, chosen_base_id } = starting_state.user_info
    if (user && chosen_base_id !== undefined) load_state(store)
}
