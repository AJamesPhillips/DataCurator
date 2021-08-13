import { Session } from "@inrupt/solid-client-authn-browser"

import { pick } from "../../shared/utils/pick"
import type { RootState } from "../State"
import { get_persisted_state_object, persist_state_object } from "../utils/persistence_utils"
import type { UserInfoState } from "./state"



export function user_info_persist (state: RootState)
{
    const to_persist = pick([
        "solid_oidc_provider",
    ], state.user_info)

    persist_state_object("user_info", to_persist)
}



export function user_info_starting_state (): UserInfoState
{
    const obj = get_persisted_state_object<UserInfoState>("user_info")

    const state: UserInfoState = {
        solid_oidc_provider: "",
        ...obj,
    }

    return state
}
