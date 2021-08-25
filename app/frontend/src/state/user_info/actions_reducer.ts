import type { Action, AnyAction } from "redux"

import { unique_list, upsert_entry } from "../../utils/list"
import { update_substate } from "../../utils/update_state"
import type { RootState } from "../State"



export const user_info_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_update_solid_oidc_provider(action))
    {
        state = update_substate(state, "user_info", "solid_oidc_provider", action.solid_oidc_provider)
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
        }
    }


    if (is_update_custom_solid_pod_URLs(action))
    {
        const custom_solid_pod_URLs = unique_list(action.custom_solid_pod_URLs)
        state = update_substate(state, "user_info", "custom_solid_pod_URLs", custom_solid_pod_URLs)
    }


    if (is_update_chosen_custom_solid_pod_URL_index(action))
    {
        state = update_substate(state, "user_info", "chosen_custom_solid_pod_URL_index", action.chosen_custom_solid_pod_URL_index)
    }


    return state
}



interface UpdateSolidOidcProviderArgs
{
    solid_oidc_provider: string
}

interface ActionUpdateSolidOidcProvider extends Action, UpdateSolidOidcProviderArgs {}

const update_solid_oidc_provider_type = "update_solid_oidc_provider"

const update_solid_oidc_provider = (args: UpdateSolidOidcProviderArgs): ActionUpdateSolidOidcProvider =>
{
    return { type: update_solid_oidc_provider_type, ...args }
}

const is_update_solid_oidc_provider = (action: AnyAction): action is ActionUpdateSolidOidcProvider => {
    return action.type === update_solid_oidc_provider_type
}



interface UpdateUsersNameAndSolidPodUrlArgs
{
    user_name: string
    default_solid_pod_URL: string
}

interface ActionUpdateUsersNameAndSolidPodUrl extends Action, UpdateUsersNameAndSolidPodUrlArgs {}

const update_users_name_and_solid_pod_URL_type = "update_users_name_and_solid_pod_URL"

const update_users_name_and_solid_pod_URL = (args: UpdateUsersNameAndSolidPodUrlArgs): ActionUpdateUsersNameAndSolidPodUrl =>
{
    return { type: update_users_name_and_solid_pod_URL_type, ...args }
}

const is_update_users_name_and_solid_pod_URL = (action: AnyAction): action is ActionUpdateUsersNameAndSolidPodUrl => {
    return action.type === update_users_name_and_solid_pod_URL_type
}



interface UpdateCustomSolidPodUrlsArgs
{
    custom_solid_pod_URLs: string[]
}

interface ActionUpdateCustomSolidPodUrls extends Action, UpdateCustomSolidPodUrlsArgs {}

const update_custom_solid_pod_URLs_type = "update_custom_solid_pod_URLs"

const update_custom_solid_pod_URLs = (args: UpdateCustomSolidPodUrlsArgs): ActionUpdateCustomSolidPodUrls =>
{
    return { type: update_custom_solid_pod_URLs_type, ...args }
}

const is_update_custom_solid_pod_URLs = (action: AnyAction): action is ActionUpdateCustomSolidPodUrls => {
    return action.type === update_custom_solid_pod_URLs_type
}



interface UpdateChosenCustomSolidPodUrlIndexArgs
{
    chosen_custom_solid_pod_URL_index: number
}

interface ActionUpdateChosenCustomSolidPodUrlIndex extends Action, UpdateChosenCustomSolidPodUrlIndexArgs {}

const update_chosen_custom_solid_pod_URL_index_type = "update_chosen_custom_solid_pod_URL_index"

const update_chosen_custom_solid_pod_URL_index = (args: UpdateChosenCustomSolidPodUrlIndexArgs): ActionUpdateChosenCustomSolidPodUrlIndex =>
{
    return { type: update_chosen_custom_solid_pod_URL_index_type, ...args }
}

const is_update_chosen_custom_solid_pod_URL_index = (action: AnyAction): action is ActionUpdateChosenCustomSolidPodUrlIndex => {
    return action.type === update_chosen_custom_solid_pod_URL_index_type
}



export const user_info_actions = {
    update_solid_oidc_provider,
    update_users_name_and_solid_pod_URL,
    update_custom_solid_pod_URLs,
    update_chosen_custom_solid_pod_URL_index,
}
