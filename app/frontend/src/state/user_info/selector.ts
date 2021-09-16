import type { RootState } from "../State"



export function selector_user_name (state: RootState)
{
    return state.user_info.user_name
}
