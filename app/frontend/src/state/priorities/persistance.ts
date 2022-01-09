import type { ViewPrioritiesState } from "./state"



export function view_priorities_starting_state (): ViewPrioritiesState
{

    const state: ViewPrioritiesState = {
        action_ids_to_show: [],
        date_shown: undefined,
    }

    return state
}
