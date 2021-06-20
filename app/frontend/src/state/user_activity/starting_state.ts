import type { UserActivityState } from "./state"



export function user_activity_starting_state (): UserActivityState
{
    const state: UserActivityState = {
        is_editing_text: false,
    }

    return state
}
