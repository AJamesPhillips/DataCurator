import { get_supabase } from "../../supabase/get_supabase"
import { get_store } from "../store"
import { conditionally_save_state } from "../sync/utils/conditionally_save_state"



export async function signout ()
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

    }

    try
    {
        const { error } = await supabase.auth.signOut()
    }
    catch (err)
    {

    }

    window.location.reload() // much simplier way to reset all the state
}
