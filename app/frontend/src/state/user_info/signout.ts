import { getDefaultSession } from "@inrupt/solid-client-authn-browser"
import { ACTIONS } from "../actions"
import { get_store } from "../store"
import { backup_throttled_save_state } from "../sync/backup/periodically_backup_solid_data"
import { throttled_save_state } from "../sync/utils/save_state"



export async function signout ()
{
    const solid_session = getDefaultSession()
    const store = get_store()

    await solid_session.logout()

    store.dispatch(ACTIONS.user_info.update_users_name_and_solid_pod_URL({ user_name: "", default_solid_pod_URL: "" }))
    store.dispatch(ACTIONS.sync.set_next_sync_ms({ next_save_ms: undefined }))
    throttled_save_state.cancel()
    backup_throttled_save_state.cancel()
}
