import { ACTIONS } from "../../state/actions"
import type { StoreType } from "../../state/store"
import { signout } from "../../state/user_info/signout"
import { get_supabase } from "../../supabase/get_supabase"
import { register_window_on_focus_listener } from "../../utils/window_on_focus_listener"



let registered = false
export function register_window_focus_session_check (store: StoreType)
{
    if (registered)
    {
        console.error("Already run register_window_focus_session_check")
        return
    }
    registered = true


    const supabase = get_supabase()
    register_window_on_focus_listener(() =>
    {
        if (!store.getState().user_info.user)
        {
            console.log("User not signed in yet.")
            return
        }


        // Check if user session is still working or if it has expired
        supabase.auth.update({})
        .then(response =>
        {
            let network_functional = true

            if (response.error?.message === "Not logged in.")
            {
                console.log("User not logged in.  Reloading page.")
                signout()
            }
            else if (response.error?.message === "Network request failed")
            {
                console.log("Network error")
                network_functional = false
            }
            else if (response.error)
            {
                debugger
                console.log("Some error whilst doing no-op update to user info.", response.error)
                signout()
            }
            else
            {
                console.log("On window focus event, successfully accessed user info.")
            }
            store.dispatch(ACTIONS.sync.update_network_status({ network_functional }))
        })
        .catch(err =>
        {
            debugger // temporary addition whilst we develop this in parallel with other work, will remove later
            if (err?.status === 401)
            {
                signout()
            }
        })
    })
}
