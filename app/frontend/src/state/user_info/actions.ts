import type { User as SupabaseAuthUser } from "@supabase/supabase-js"
import type { Action, AnyAction } from "redux"
import type { SupabaseKnowledgeBaseWithAccess, SupabaseUser } from "../../supabase/interfaces"

import { ensure_user_name } from "./persistance"



interface SetUserArgs
{
    user: SupabaseAuthUser | null
}

interface ActionSetUser extends Action, SetUserArgs {}

const set_user_type = "set_user"

const set_user = (args: SetUserArgs): ActionSetUser =>
{
    return { type: set_user_type, ...args }
}

export const is_set_user = (action: AnyAction): action is ActionSetUser => {
    return action.type === set_user_type
}



interface SetNeedToHandlePasswordRecoveryArgs
{
    need_to_handle_password_recovery: boolean
}

interface ActionSetNeedToHandlePasswordRecovery extends Action, SetNeedToHandlePasswordRecoveryArgs {}

const set_need_to_handle_password_recovery_type = "set_need_to_handle_password_recovery"

const set_need_to_handle_password_recovery = (need_to_handle_password_recovery: boolean): ActionSetNeedToHandlePasswordRecovery =>
{
    return { type: set_need_to_handle_password_recovery_type, need_to_handle_password_recovery }
}

export const is_set_need_to_handle_password_recovery = (action: AnyAction): action is ActionSetNeedToHandlePasswordRecovery => {
    return action.type === set_need_to_handle_password_recovery_type
}



interface SetUsersArgs
{
    users: SupabaseUser[] | undefined
}

interface ActionSetUsers extends Action, SetUsersArgs {}

const set_users_type = "set_users"

const set_users = (args: SetUsersArgs): ActionSetUsers =>
{
    return { type: set_users_type, ...args }
}

export const is_set_users = (action: AnyAction): action is ActionSetUsers => {
    return action.type === set_users_type
}



interface UpdateUsersNameArgs
{
    user_name: string
}

interface ActionUpdateUsersName extends Action, UpdateUsersNameArgs {}

const update_users_name_type = "update_users_name"

const update_users_name = (args: UpdateUsersNameArgs): ActionUpdateUsersName =>
{
    // const user_name = ensure_user_name(args.user_name)
    return { type: update_users_name_type, ...args }
}

export const is_update_users_name = (action: AnyAction): action is ActionUpdateUsersName => {
    return action.type === update_users_name_type
}



interface UpdateChosenBaseIdArgs
{
    base_id: number | undefined
}

interface ActionUpdateChosenBaseId extends Action, UpdateChosenBaseIdArgs {}

const update_chosen_base_id_type = "update_chosen_base_id"

const update_chosen_base_id = (args: UpdateChosenBaseIdArgs): ActionUpdateChosenBaseId =>
{
    return { type: update_chosen_base_id_type, ...args }
}

export const is_update_chosen_base_id = (action: AnyAction): action is ActionUpdateChosenBaseId => {
    return action.type === update_chosen_base_id_type
}



interface UpdateBasesArgs
{
    bases: SupabaseKnowledgeBaseWithAccess[] | undefined
}

interface ActionUpdateBases extends Action, UpdateBasesArgs {}

const update_bases_type = "update_bases"

const update_bases = (args: UpdateBasesArgs): ActionUpdateBases =>
{
    return { type: update_bases_type, ...args }
}

export const is_update_bases = (action: AnyAction): action is ActionUpdateBases => {
    return action.type === update_bases_type
}



export const user_info_actions = {
    set_user,
    set_need_to_handle_password_recovery,
    set_users,
    update_users_name,
    update_chosen_base_id,
    update_bases,
}
