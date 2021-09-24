import type { Store } from "redux"

import { get_supabase } from "../../supabase/get_supabase"
import type { SupabaseUser } from "../../supabase/interfaces"
import { ACTIONS } from "../actions"
import { pub_sub } from "../pub_sub/pub_sub"
import type { RootState } from "../State"



export function user_info_subscribers (store: Store<RootState>)
{
    const starting_state = store.getState()

    pub_sub.user.sub("changed_user", () => get_users(store))

    const { user, users_by_id } = starting_state.user_info
    // We may satrt with a supabase user (from the synchronous restore from localstorage state)
    if (user && !users_by_id) get_users(store)

    pub_sub.user.sub("stale_users_by_id", () => get_users(store))

    pub_sub.user.sub("changed_users_by_id", () => update_users_name(store))
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



function update_users_name (store: Store<RootState>)
{
    const state = store.getState()
    const { user, user_name, users_by_id } = state.user_info

    let new_user_name: string | undefined = undefined
    if (user && users_by_id) new_user_name = users_by_id[user.id]?.name

    if (user_name !== new_user_name)
    {
        store.dispatch(ACTIONS.user_info.update_users_name({ user_name: new_user_name }))
    }
}
