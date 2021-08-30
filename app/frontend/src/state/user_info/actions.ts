import type { Action, AnyAction } from "redux"



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

export const is_update_solid_oidc_provider = (action: AnyAction): action is ActionUpdateSolidOidcProvider => {
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

export const is_update_users_name_and_solid_pod_URL = (action: AnyAction): action is ActionUpdateUsersNameAndSolidPodUrl => {
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

export const is_update_custom_solid_pod_URLs = (action: AnyAction): action is ActionUpdateCustomSolidPodUrls => {
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

export const is_update_chosen_custom_solid_pod_URL_index = (action: AnyAction): action is ActionUpdateChosenCustomSolidPodUrlIndex => {
    return action.type === update_chosen_custom_solid_pod_URL_index_type
}



interface EnsureSolidPodUrlIsChosenArgs
{
    chosen_solid_pod_URL: string
}

interface ActionEnsureSolidPodUrlIsChosen extends Action, EnsureSolidPodUrlIsChosenArgs {}

const ensure_solid_pod_URL_is_chosen_type = "ensure_solid_pod_URL_is_chosen"

const ensure_solid_pod_URL_is_chosen = (args: EnsureSolidPodUrlIsChosenArgs): ActionEnsureSolidPodUrlIsChosen =>
{
    return { type: ensure_solid_pod_URL_is_chosen_type, ...args }
}

export const is_ensure_solid_pod_URL_is_chosen = (action: AnyAction): action is ActionEnsureSolidPodUrlIsChosen => {
    return action.type === ensure_solid_pod_URL_is_chosen_type
}



export const user_info_actions = {
    update_solid_oidc_provider,
    update_users_name_and_solid_pod_URL,
    update_custom_solid_pod_URLs,
    update_chosen_custom_solid_pod_URL_index,
    ensure_solid_pod_URL_is_chosen,
}
