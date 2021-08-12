import type { Action, AnyAction } from "redux"

import { update_substate } from "../../utils/update_state"
import type { RootState } from "../State"



export const user_info_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_update_solid_oidc_provider(action))
    {
        state = update_substate(state, "user_info", "solid_oidc_provider", action.solid_oidc_provider)
    }


    return state
}



interface UpdateSolidOidcProviderArgs
{
    solid_oidc_provider: string
}

interface ActionUpdateSolidOidcProvider extends Action, UpdateSolidOidcProviderArgs {}

const update_solid_oidc_provider_type = "update_solid_oidc_provider"

export const update_solid_oidc_provider = (args: UpdateSolidOidcProviderArgs): ActionUpdateSolidOidcProvider =>
{
    return { type: update_solid_oidc_provider_type, ...args }
}

const is_update_solid_oidc_provider = (action: AnyAction): action is ActionUpdateSolidOidcProvider => {
    return action.type === update_solid_oidc_provider_type
}



export const user_info_actions = {
    update_solid_oidc_provider,
}
