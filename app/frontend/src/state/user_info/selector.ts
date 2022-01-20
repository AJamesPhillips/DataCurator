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


export function selector_chosen_base (state: RootState)
{
    const { bases_by_id, chosen_base_id } = state.user_info
    const base = bases_by_id && bases_by_id[chosen_base_id || ""]
    return base
}


export function selector_chosen_base_name (state: RootState)
{
    const base = selector_chosen_base(state)
    const chosen_base_id = selector_chosen_base_id(state)

    return base ? base.title : (chosen_base_id === undefined ? "Not set" : `Store: ${chosen_base_id}`)
}


export function selector_editable_bases (state: RootState)
{
    const { user, bases_by_id } = state.user_info
    if (!user) return undefined // if no user then no editing so by definition no editable base
    if (!bases_by_id) return undefined

    return Object.values(bases_by_id).filter(b => b.access_level === "editor" || b.access_level === "owner")
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
