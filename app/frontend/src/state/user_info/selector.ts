import type { RootState } from "../State"



function selector_current_user (state: RootState)
{
    const { user, users_by_id } = state.user_info

    return (user && users_by_id) ? users_by_id[user.id] : undefined
}


export function selector_user_name (state: RootState)
{
    const user = selector_current_user(state)

    return user?.name
}


export function selector_need_to_set_user_name (state: RootState)
{
    const { user, users_by_id } = state.user_info
    return user && users_by_id && !selector_user_name(state)
}


export function selector_chosen_base (state: RootState, log_error = "")
{
    const { bases_by_id, chosen_base_id } = state.user_info
    const chosen_base = bases_by_id && bases_by_id[chosen_base_id || ""]

    function log_error_msg (message: string)
    {
        if (!log_error) return
        console.error(message + log_error)
    }

    if (!bases_by_id) log_error_msg("No state.user_info.bases_by_id present")
    if (chosen_base_id === undefined) log_error_msg("No state.user_info.chosen_base_id present")
    if (chosen_base === undefined) log_error_msg("No chosen_base present")

    return chosen_base
}


export function selector_chosen_base_name (state: RootState)
{
    const base = selector_chosen_base(state)
    const chosen_base_id = selector_chosen_base_id(state)

    return base ? base.title : (chosen_base_id === undefined ? "Not set" : `Unknown Store: ${chosen_base_id}`)
}


export function selector_editable_bases (state: RootState)
{
    const { user, bases_by_id } = state.user_info
    if (!user) return undefined // if no user then no editing so by definition no editable base
    if (!bases_by_id) return undefined

    return Object.values(bases_by_id).filter(b => b.can_edit)
}


export function selector_have_an_editable_base (state: RootState)
{
    const a_bases = selector_editable_bases(state)

    return a_bases === undefined ? undefined : a_bases.length > 0
}


export function selector_chosen_base_id (state: RootState)
{
    return state.user_info.chosen_base_id
}


export function selector_needs_to_create_a_base (state: RootState)
{
    const { bases_by_id } = state.user_info
    if (bases_by_id === undefined) return false

    return selector_have_an_editable_base(state) === false
        && selector_chosen_base(state) === undefined
}



export function selector_current_user_access_level (state: RootState)
{
    const base = selector_chosen_base(state)

    return base?.access_level
}


export function selector_can_not_edit (state: RootState)
{
    const access_level = selector_current_user_access_level(state)

    return access_level === undefined || access_level === "viewer" || access_level === "none"
}
