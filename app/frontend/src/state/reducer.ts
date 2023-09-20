import type { Reducer } from "preact/hooks"
import type { AnyAction } from "redux"

import { controls_reducer } from "./controls/reducer"
import { creation_context_reducer } from "./creation_context/reducer"
import { derived_state_reducer } from "./derived/reducer"
import { display_reducer } from "./display_options/reducer"
import { filter_context_reducer } from "./filter_context/reducer"
import { global_keys_reducer } from "./global_keys/reducer"
import { view_priorities_reducer } from "./priorities/reducer"
import { display_at_created_datetime_reducer } from "./routing/datetime/display_at_created"
import { display_at_sim_datetime_reducer } from "./routing/datetime/display_at_sim_datetime"
import { routing_reducer } from "./routing/reducer"
import { search_reducer } from "./search/actions_reducer"
import { meta_wcomponents_reducer } from "./specialised_objects/meta_wcomponents/reducer"
import { derived_meta_wcomponents_state_reducer } from "./specialised_objects/meta_wcomponents/selecting/derived"
import { specialised_objects_reducer } from "./specialised_objects/reducer"
import type { RootState } from "./State"
import { sync_reducer } from "./sync/reducer"
import { user_info_reducer } from "./user_info/reducer"



export const root_reducer: Reducer<RootState, any> = ((state: RootState, action: AnyAction) =>
{
    const initial_state = state

    state = display_reducer(state, action)
    state = sync_reducer(state, action)
    state = routing_reducer(state, action)
    state = global_keys_reducer(state, action)
    state = display_at_created_datetime_reducer(state, action)
    state = display_at_sim_datetime_reducer(state, action)
    state = specialised_objects_reducer(state, action)
    state = meta_wcomponents_reducer(state, action)
    state = controls_reducer(state, action)
    state = creation_context_reducer(state, action)
    state = filter_context_reducer(state, action)
    state = user_info_reducer(state, action)
    state = view_priorities_reducer(state, action)
    state = search_reducer(state, action)

    state = { ...state, last_action: action }

    state = derived_state_reducer(initial_state, state)
    state = derived_meta_wcomponents_state_reducer(initial_state, state)

    // console .log(action.type, action)

    ;(window as any).debug_state = state

    return state
})
