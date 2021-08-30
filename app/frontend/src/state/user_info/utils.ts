import { bounded } from "../../shared/utils/bounded"
import { update_state } from "../../utils/update_state"
import type { RootState } from "../State"
import type { UserInfoState } from "./state"



export function ensure_chosen_index_is_valid (user_info: UserInfoState, new_index?: number)
{
    const custom_solid_pod_URLs = user_info.custom_solid_pod_URLs.filter(u => !!u)
    if (custom_solid_pod_URLs.length !== user_info.custom_solid_pod_URLs.length)
    {
        user_info = update_state(user_info, "custom_solid_pod_URLs", custom_solid_pod_URLs)
    }

    const index = new_index === undefined
        ? user_info.chosen_custom_solid_pod_URL_index
        : new_index

    // remember that `chosen_custom_solid_pod_URL_index` is 1 based
    let bounded_index = bounded(index, 0, user_info.custom_solid_pod_URLs.length)
    if (bounded_index !== index) bounded_index = 0
    user_info = update_state(user_info, "chosen_custom_solid_pod_URL_index", bounded_index)

    return user_info
}



export function ensure_chosen_index_is_valid_using_root (state: RootState, new_index?: number)
{
    const user_info = ensure_chosen_index_is_valid(state.user_info, new_index)
    state = update_state(state, "user_info", user_info)
    return state
}
