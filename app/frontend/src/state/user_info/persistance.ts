import { Session } from "@inrupt/solid-client-authn-browser"

import { pick } from "../../shared/utils/pick"
import type { RootState } from "../State"
import { get_persisted_state_object, persist_state_object } from "../persistence/persistence_utils"
import type { UserInfoState } from "./state"



export function user_info_persist (state: RootState)
{
    const to_persist = pick([
        "solid_oidc_provider",
        // This smells like a hack.  Putting it in so that
        // load_solid_data works on first load
        "user_name",
        "solid_pod_URL",
    ], state.user_info)

    persist_state_object("user_info", to_persist)
}



export function user_info_starting_state (): UserInfoState
{
    const obj = get_persisted_state_object<UserInfoState>("user_info")

    const state: UserInfoState = {
        solid_oidc_provider: "",
        user_name: "",
        solid_pod_URL: "",
        ...obj,
    }

    return state
}
