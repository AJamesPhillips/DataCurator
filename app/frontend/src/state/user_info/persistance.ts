import { pick } from "../../shared/utils/pick"
import type { RootState } from "../State"
import { get_persisted_state_object, persist_state_object } from "../persistence/persistence_utils"
import type { UserInfoState } from "./state"
import { ensure_chosen_index_is_valid } from "./utils"



export function user_info_persist (state: RootState)
{
    const to_persist = pick([
        "solid_oidc_provider",
        // // Persisting user_name and default_solid_pod_URL smells like a hack.
        // // Putting it in so that load_solid_data works on first load.
        // // Alternative is to instantiate the store twice, once first for the
        // // restore_session code and then for the app
        // "user_name",
        // "default_solid_pod_URL",

        "custom_solid_pod_URLs",
        "chosen_custom_solid_pod_URL_index",
    ], state.user_info)

    persist_state_object("user_info", to_persist)
}



export function user_info_starting_state (storage_location: string): UserInfoState
{
    const obj = get_persisted_state_object<UserInfoState>("user_info")

    let state: UserInfoState = {
        solid_oidc_provider: "",
        user_name: "",
        default_solid_pod_URL: "",
        custom_solid_pod_URLs: [],
        chosen_custom_solid_pod_URL_index: 0,
        ...obj,
    }

    if (storage_location)
    {
        const index = state.custom_solid_pod_URLs.findIndex(url => url === storage_location)

        if (state.default_solid_pod_URL === storage_location)
        {
            state.chosen_custom_solid_pod_URL_index = 0
            state.custom_solid_pod_URLs = state.custom_solid_pod_URLs.filter(url => url !== storage_location)
        }
        else if (index >= 0)
        {
            state.chosen_custom_solid_pod_URL_index = index + 1
        }
        else
        {
            state.custom_solid_pod_URLs.push(storage_location)
            // Remember `chosen_custom_solid_pod_URL_index` is 1 indexed so we can use `.length`
            state.chosen_custom_solid_pod_URL_index = state.custom_solid_pod_URLs.length
        }
    }


    state = ensure_chosen_index_is_valid(state)


    return state
}
