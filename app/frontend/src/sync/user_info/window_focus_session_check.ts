import type { SupabaseClient } from "@supabase/supabase-js"
import { ACTIONS } from "../../state/actions"
import type { StoreType } from "../../state/store"
import { save_and_optionally_signout } from "../../state/user_info/signout"
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


    register_window_on_focus_listener(() => check_and_handle_connection_and_session(store))
}



export async function check_and_handle_connection_and_session (store: StoreType)
{
    const supabase = get_supabase()
    const result = await check_connection_and_session(store, supabase)

    handle_connection_and_session_check_result(result, store)
}



enum CheckConnectionAndSessionResult
{
    no_user,
    not_signed_in,
    no_network_connection,
    unexpected_error,
    success,
}
async function check_connection_and_session (store: StoreType, supabase: SupabaseClient): Promise<CheckConnectionAndSessionResult>
{
    if (!store.getState().user_info.user)
    {
        console.log("User not signed in once yet.")
        return CheckConnectionAndSessionResult.no_user
    }

    try
    {
        const response = await supabase.auth.update({})
        if (response.error?.message === "Not logged in." || (response.error as any)?.status === 401)
        {
            // Can get response:
            //   * { error: {message: 'Not logged in.', other fields ...?}, other fields ...?}
            //   * { error: {message: 'Invalid token: token is expired by 27m3s', status: 401}, other fields ...?}

            return CheckConnectionAndSessionResult.not_signed_in
        }
        else if (response.error?.message === "Network request failed")
        {
            console.log("Network error")
            return CheckConnectionAndSessionResult.no_network_connection
        }
        else if (response.error)
        {
            debugger // temporary addition whilst we develop this in parallel with other work, will remove later
            console. log("Unexpected error whilst check_connection_and_session", response.error)
            return CheckConnectionAndSessionResult.unexpected_error
        }
        else
        {
            console. log("On window focus event, successfully accessed user info.")
            return CheckConnectionAndSessionResult.success
        }
    }
    catch (err)
    {
        console.error("Unexpected exception whilst check_connection_and_session", err)
        return CheckConnectionAndSessionResult.unexpected_error
    }
}



function handle_connection_and_session_check_result (result: CheckConnectionAndSessionResult, store: StoreType)
{
    if (result === CheckConnectionAndSessionResult.no_user)
    {
        return
    }
    else if (result === CheckConnectionAndSessionResult.not_signed_in)
    {
        // TODO research how to attempt to refresh the session and iff that fails, only then call signout
        console.log("User not logged in.  Reloading page.")
        window.location.reload()
        return
    }
    else if (result === CheckConnectionAndSessionResult.unexpected_error)
    {
        save_and_optionally_signout(false)
        return
    }

    let network_functional = true
    if (result === CheckConnectionAndSessionResult.no_network_connection)
    {
        network_functional = false
    }
    else if (result === CheckConnectionAndSessionResult.success)
    {
        // no op
    }

    store.dispatch(ACTIONS.sync.update_network_status({ network_functional, last_checked: new Date() }))
}
