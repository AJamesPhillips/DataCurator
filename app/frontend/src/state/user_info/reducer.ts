import type { AnyAction } from "redux"
import type { SupabaseKnowledgeBaseWithAccessById, SupabaseUsersById } from "../../supabase/interfaces"

import { update_substate } from "../../utils/update_state"
import { pub_sub } from "../pub_sub/pub_sub"
import type { RootState } from "../State"
import {
    is_set_user,
    is_update_users_name,
    is_set_need_to_handle_password_recovery,
    is_update_bases,
    is_update_chosen_base_id,
    is_set_users,
} from "./actions"



export const user_info_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_set_user(action))
    {
        state = update_substate(state, "user_info", "user", action.user)
        // New pattern, not sure this is a good idea yet but far simpler than making a
        // host of subscribers which have to store state and that run on ever store change
        pub_sub.user.pub("changed_user", action.user)
    }


    if (is_set_users(action))
    {
        let map: SupabaseUsersById | undefined = undefined

        if (action.users)
        {
            map = {}
            action.users.forEach(u => map![u.id] = u)
        }

        state = update_substate(state, "user_info", "users_by_id", map)
        state = update_users_name(state)
    }


    if (is_set_need_to_handle_password_recovery(action))
    {
        state = update_substate(state, "user_info", "need_to_handle_password_recovery", action.need_to_handle_password_recovery)
    }


    if (is_update_users_name(action))
    {
        const { user_name } = action
        state = update_substate(state, "user_info", "user_name", user_name)
    }


    if (is_update_bases(action))
    {
        const { bases } = action

        let bases_by_id: SupabaseKnowledgeBaseWithAccessById | undefined = undefined
        if (bases)
        {
            bases_by_id = {}
            bases.forEach(b => bases_by_id![b.id] = b)
        }

        state = update_substate(state, "user_info", "bases_by_id", bases_by_id)

        const { chosen_base_id } = state.user_info
        if (bases_by_id && (!chosen_base_id || !bases_by_id[chosen_base_id]))
        {
            state = update_substate(state, "user_info", "chosen_base_id", bases && bases[0]?.id)
        }
    }


    if (is_update_chosen_base_id(action))
    {
        state = update_substate(state, "user_info", "chosen_base_id", action.base_id)
    }

    return state
}



function update_users_name (state: RootState)
{
    const { user, user_name: current_user_name, users_by_id } = state.user_info

    let new_user_name: string | undefined = undefined
    if (user && users_by_id) new_user_name = users_by_id[user.id]?.name

    if (new_user_name !== current_user_name)
    {
        state = update_substate(state, "user_info", "user_name", new_user_name)
    }

    return state
}
