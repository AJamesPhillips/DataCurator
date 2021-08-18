import type { Action, AnyAction } from "redux"

import { get_pod_URL } from "../../sync/user_info/solid/urls"
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
        state = update_substate(state, "user_info", "user_name", action.user_name_from_solid)
        const pod_URL = get_pod_URL(state.user_info) || ""
        state = update_substate(state, "user_info", "solid_pod_URL", pod_URL)
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



export const user_info_actions = {
    update_solid_oidc_provider,
    update_user_name_from_solid,
}
