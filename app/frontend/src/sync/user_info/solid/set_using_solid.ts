import { ERRORS } from "../../../shared/errors"
import { ACTIONS } from "../../../state/actions"
import { get_store } from "../../../state/store"
import { selector_is_using_solid_for_storage } from "../../../state/sync/selector"
import { get_solid_users_name_and_pod_URL } from "./get_solid_username"



export async function set_using_solid (using_solid: boolean)
{
    const store = get_store()
    const state = store.getState()
    if (selector_is_using_solid_for_storage(state) === using_solid) return


    store.dispatch(ACTIONS.sync.set_used_storage_type({ storage_type: "solid", using: using_solid }))
    if (!using_solid) return

    try {
        const { user_name } = await get_solid_users_name_and_pod_URL()
        if (!user_name) return

        // Check the user is still using solid and has not toggled it back to false
        if (!selector_is_using_solid_for_storage(store.getState())) return

        store.dispatch(ACTIONS.user_info.update_users_name({ user_name }))
    }
    catch (err)
    {
        if (err === ERRORS.NOT_LOGGED_IN || err === ERRORS.NO_SOLID_WEB_ID) return console .log("set_using_solid " + err)
        console.error("set_using_solid ", using_solid, " got error: ", err)
    }

}
