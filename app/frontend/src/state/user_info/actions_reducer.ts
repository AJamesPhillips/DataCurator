import type { Action, AnyAction } from "redux"

import { make_default_solid_pod_URL } from "../../sync/user_info/solid/urls"
import { update_substate } from "../../utils/update_state"
import type { RootState } from "../State"



export const user_info_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_update_solid_oidc_provider(action))
    {
        state = update_substate(state, "user_info", "solid_oidc_provider", action.solid_oidc_provider)
    }


    if (is_update_user_name_from_solid(action))
    {
        const { user_name_from_solid: user_name } = action
        state = update_substate(state, "user_info", "user_name", user_name)
        const default_solid_pod_URL = make_default_solid_pod_URL(state.user_info)
        state = update_substate(state, "user_info", "default_solid_pod_URL", default_solid_pod_URL)

        let { custom_solid_pod_URLs } = state.user_info
        if (default_solid_pod_URL && !custom_solid_pod_URLs.includes(default_solid_pod_URL))
        {
            custom_solid_pod_URLs = [...custom_solid_pod_URLs, default_solid_pod_URL]
            state = update_substate(state, "user_info", "custom_solid_pod_URLs", custom_solid_pod_URLs)
        }
    }


    if (is_update_use_custom_solid_pod_URL(action))
    {
        state = update_substate(state, "user_info", "chosen_solid_pod_URL_index", action.use_custom_pod_URL)
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



interface UpdateUserNameFromSolidArgs
{
    user_name_from_solid: string
}

interface ActionUpdateUserNameFromSolid extends Action, UpdateUserNameFromSolidArgs {}

const update_user_name_from_solid_type = "update_user_name_from_solid"

const update_user_name_from_solid = (args: UpdateUserNameFromSolidArgs): ActionUpdateUserNameFromSolid =>
{
    return { type: update_user_name_from_solid_type, ...args }
}

const is_update_user_name_from_solid = (action: AnyAction): action is ActionUpdateUserNameFromSolid => {
    return action.type === update_user_name_from_solid_type
}



interface UpdateUseCustomSolidPodUrlArgs
{
    use_custom_pod_URL: number
}

interface ActionUpdateUseCustomSolidPodUrl extends Action, UpdateUseCustomSolidPodUrlArgs {}

const update_use_custom_solid_pod_URL_type = "update_use_custom_solid_pod_URL"

const update_use_custom_solid_pod_URL = (args: UpdateUseCustomSolidPodUrlArgs): ActionUpdateUseCustomSolidPodUrl =>
{
    return { type: update_use_custom_solid_pod_URL_type, ...args }
}

const is_update_use_custom_solid_pod_URL = (action: AnyAction): action is ActionUpdateUseCustomSolidPodUrl => {
    return action.type === update_use_custom_solid_pod_URL_type
}



export const user_info_actions = {
    update_solid_oidc_provider,
    update_user_name_from_solid,
    update_use_custom_solid_pod_URL,
}
