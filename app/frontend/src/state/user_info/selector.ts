import type { RootState } from "../State"



export function selector_user_name (state: RootState)
{
    return state.user_info.user_name
}


export function selector_chosen_storage (state: RootState)
{
    const { bases, chosen_base_id } = state.user_info
    const base = chosen_base_id === undefined ? undefined : (bases && bases[chosen_base_id])
    return { base, chosen_base_id }
}


export function selector_storage_name (state: RootState)
{
    const { base, chosen_base_id } = selector_chosen_storage(state)

    return base ? base.title : (chosen_base_id === undefined ? "Not set" : `Store: ${chosen_base_id}`)
}
