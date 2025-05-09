import { get_supabase } from "../../supabase/get_supabase"
import { logger } from "../../utils/logger"
import { get_store } from "../store"
import { conditionally_save_state } from "../sync/utils/conditionally_save_state"



export async function save_and_optionally_signout (signout: boolean)
{
    const store = get_store()
    const supabase = get_supabase()

    try
    {
        // We should either:
        //  1. wait for all loading to finish.
        //  2. cancel any loading.
        // At the moment this will not run if state.sync.reading_for_writing is not true
        await conditionally_save_state(store)
    }
    catch (err)
    {
        logger.debug(`Error saving state before signout ${err}`)
    }

    try
    {
        if (signout)
        {
            debugger
            console.log("Signing out with supabase.auth.signOut()")
            const { error } = await supabase.auth.signOut()
            localStorage.clear()
        }
    }
    catch (err)
    {
        logger.debug(`Error signing out ${err}`)
    }

    window.location.reload() // much simplier way to reset all the state
}
