import type { Store } from "redux"

import { get_all_bases } from "../../supabase/bases"
import { get_supabase } from "../../supabase/get_supabase"
import type {
    SupabaseUser,
} from "../../supabase/interfaces"
import { ACTIONS } from "../actions"
import { pub_sub } from "../pub_sub/pub_sub"
import type { RootState } from "../State"



export function user_info_subscribers (store: Store<RootState>)
{
    const starting_state = store.getState()

    const { user, users_by_id, bases } = starting_state.user_info
    // We may start with a supabase user (from the synchronous restore from localstorage state)
    if (user && !users_by_id) get_users(store)
    if (user && !bases) get_bases(store)


    pub_sub.user.sub("changed_user", () =>
    {
        get_users(store)
        get_bases(store)
    })


    pub_sub.user.sub("stale_users_by_id", () => get_users(store))
}



async function get_users (store: Store<RootState>)
{
    const { user } = store.getState().user_info

    if (!user)
    {
        store.dispatch(ACTIONS.user_info.set_users({ users: undefined }))
        return
    }

    const supabase = get_supabase()
    const { data, error } = await supabase.from<SupabaseUser>("users").select("*")
    // set_postgrest_error(error)

    if (data) store.dispatch(ACTIONS.user_info.set_users({ users: data }))
}



async function get_bases (store: Store<RootState>)
{
    const { user, bases: current_bases } = store.getState().user_info

    if (!user)
    {
        store.dispatch(ACTIONS.user_info.update_bases({ bases: undefined }))
        return
    }

    const { data, error } = await get_all_bases()
    store.dispatch(ACTIONS.user_info.update_bases({ bases: data }))
}
