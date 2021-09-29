import type { AnyAction } from "redux"
import type { SupabaseKnowledgeBaseWithAccess, SupabaseKnowledgeBaseWithAccessById, SupabaseUsersById } from "../../supabase/interfaces"

import { update_substate } from "../../utils/update_state"
import { pub_sub } from "../pub_sub/pub_sub"
import type { RootState } from "../State"
import {
    is_set_user,
    is_set_need_to_handle_password_recovery,
    is_update_bases,
    is_update_chosen_base_id,
    is_set_users,
} from "./actions"
import { selector_editable_bases } from "./selector"



export const user_info_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_set_user(action))
    {
        state = update_substate(state, "user_info", "user", action.user)
        // New pattern, not sure this is a good idea yet but is simpler than making subscribers
        // which store state, and that run on every store change to compare to current state
        pub_sub.user.pub("changed_user", true)
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


    if (is_update_bases(action))
    {
        const { bases } = action

        const bases_by_id = build_bases_by_id_map(bases)
        state = update_substate(state, "user_info", "bases_by_id", bases_by_id)

        const initial_chosen_base_id = state.user_info.chosen_base_id
        state = ensure_valid_chosen_base_id(state)
        const changed_chosen_base_id = initial_chosen_base_id !== state.user_info.chosen_base_id

        // New pattern, not sure this is a good idea yet but is simpler than making subscribers
        // which store state, and that run on every store change to compare to current state
        pub_sub.user.pub("changed_bases", true)
        if (changed_chosen_base_id) pub_sub.user.pub("changed_chosen_base_id", true)
    }


    if (is_update_chosen_base_id(action))
    {
        const initial_chosen_base_id = state.user_info.chosen_base_id
        state = update_substate(state, "user_info", "chosen_base_id", action.base_id)
        const changed_chosen_base_id = initial_chosen_base_id !== state.user_info.chosen_base_id

        // New pattern, not sure this is a good idea yet but is simpler than making subscribers
        // which store state, and that run on every store change to compare to current state
        if (changed_chosen_base_id) pub_sub.user.pub("changed_chosen_base_id", true)
    }

    return state
}



// Probably should be a public selector but perhaps we want to have the name to be easy to
// persist and restore into the state on page reload
function selector_users_name (state: RootState)
{
    const { user, users_by_id } = state.user_info

    return (user && users_by_id) ? users_by_id[user.id]?.name : undefined
}


function update_users_name (state: RootState)
{
    const new_user_name = selector_users_name(state)

    if (new_user_name !== state.user_info.user_name)
    {
        state = update_substate(state, "user_info", "user_name", new_user_name)
    }

    return state
}



function build_bases_by_id_map (bases: SupabaseKnowledgeBaseWithAccess[] | undefined)
{
    let bases_by_id: SupabaseKnowledgeBaseWithAccessById | undefined = undefined

    if (bases)
    {
        bases_by_id = {}
        bases.forEach(b => bases_by_id![b.id] = b)
    }

    return bases_by_id
}



function ensure_valid_chosen_base_id (state: RootState)
{
    const { bases_by_id, chosen_base_id } = state.user_info

    if (bases_by_id && (chosen_base_id === undefined || !bases_by_id[chosen_base_id]))
    {
        const editable_bases = selector_editable_bases(state)

        const random_base_id: number | undefined = editable_bases && editable_bases[0]?.id
        state = update_substate(state, "user_info", "chosen_base_id", random_base_id)
    }

    return state
}
