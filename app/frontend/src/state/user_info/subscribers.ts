import { get_supabase } from "../../supabase/get_supabase"
import type { SupabaseUser } from "../../supabase/interfaces"
import { ACTIONS } from "../actions"
import { pub_sub } from "../pub_sub/pub_sub"
import type { StoreType } from "../store"
import { refresh_bases_for_current_user } from "./utils"



export function user_info_subscribers (store: StoreType)
{
    const starting_state = store.getState()
    if (!store.load_state_from_storage) return

    const { user, users_by_id, bases_by_id: bases } = starting_state.user_info
    // We may start with a supabase user (from the synchronous restore from localstorage state)
    if (user && !users_by_id) get_users(store)
    if (user && !bases) refresh_bases_for_current_user(store)


    pub_sub.user.sub("changed_user", () =>
    {
        get_users(store)
        refresh_bases_for_current_user(store)
    })


    pub_sub.user.sub("stale_users_by_id", () => get_users(store))
    pub_sub.user.sub("stale_bases", () => refresh_bases_for_current_user(store))
}



async function get_users (store: StoreType)
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
