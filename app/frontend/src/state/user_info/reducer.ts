import type { AnyAction } from "redux"

import { unique_list, upsert_entry } from "../../utils/list"
import { update_substate } from "../../utils/update_state"
import type { RootState } from "../State"
import {
    is_update_solid_oidc_provider,
    is_update_users_name_and_solid_pod_URL,
    is_update_custom_solid_pod_URLs,
    is_update_chosen_custom_solid_pod_URL_index,
    is_ensure_solid_pod_URL_is_chosen,
    is_update_users_name,
} from "./actions"
import { ensure_chosen_index_is_valid_using_root } from "./utils"



export const user_info_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_update_solid_oidc_provider(action))
    {
        state = update_substate(state, "user_info", "solid_oidc_provider", action.solid_oidc_provider)
    }


    if (is_update_users_name(action))
    {
        const { user_name } = action
        state = update_substate(state, "user_info", "user_name", user_name)
    }


    if (is_update_users_name_and_solid_pod_URL(action))
    {
        const { user_name, default_solid_pod_URL } = action
        state = update_substate(state, "user_info", "user_name", user_name)
        state = update_substate(state, "user_info", "default_solid_pod_URL", default_solid_pod_URL)

        let { custom_solid_pod_URLs } = state.user_info
        if (default_solid_pod_URL && !custom_solid_pod_URLs.includes(default_solid_pod_URL))
        {
            custom_solid_pod_URLs = upsert_entry(custom_solid_pod_URLs, default_solid_pod_URL, url => url === default_solid_pod_URL, "custom_solid_pod_URLs")
            custom_solid_pod_URLs = unique_list(custom_solid_pod_URLs)
            state = update_substate(state, "user_info", "custom_solid_pod_URLs", custom_solid_pod_URLs)

            state = ensure_chosen_index_is_valid_using_root(state)
        }
    }


    if (is_update_custom_solid_pod_URLs(action))
    {
        const custom_solid_pod_URLs = unique_list(action.custom_solid_pod_URLs)
        state = update_substate(state, "user_info", "custom_solid_pod_URLs", custom_solid_pod_URLs)

        state = ensure_chosen_index_is_valid_using_root(state)
    }


    if (is_update_chosen_custom_solid_pod_URL_index(action))
    {
        state = ensure_chosen_index_is_valid_using_root(state, action.chosen_custom_solid_pod_URL_index)
    }



    if (is_ensure_solid_pod_URL_is_chosen(action))
    {
        const { chosen_solid_pod_URL } = action
        const { default_solid_pod_URL, custom_solid_pod_URLs } = state.user_info

        let index: number
        if (default_solid_pod_URL === chosen_solid_pod_URL)
        {
            // no operation needed on default_solid_pod_URL or custom_solid_pod_URLs
            index = 0
        }
        else
        {
            index = custom_solid_pod_URLs.findIndex(url => url === chosen_solid_pod_URL)
            if (index >= 0) index += 1 // +1 as it is one based
            else
            {
                const new_custom_URLs = [...custom_solid_pod_URLs, chosen_solid_pod_URL]
                index = new_custom_URLs.length
                state = update_substate(state, "user_info", "custom_solid_pod_URLs", new_custom_URLs)
            }
        }


        state = update_substate(state, "user_info", "chosen_custom_solid_pod_URL_index", index)
    }


    return state
}
