import type { Reducer } from "preact/hooks"
import type { AnyAction } from "redux"

import { controls_reducer } from "./controls/reducer"
import { creation_context_reducer } from "./creation_context/reducer"
import { derived_state_reducer } from "./derived/reducer"
import { display_reducer } from "./display_options/reducer"
import { derived_filter_context_state_reducer } from "./filter_context/derived"
import { filter_context_reducer } from "./filter_context/reducer"
import { global_keys_reducer } from "./global_keys/reducer"
import { objectives_reducer } from "./objectives"
import { objects_reducer } from "./objects/reducer"
import { patterns_reducer } from "./patterns"
import { display_at_created_datetime_reducer } from "./routing/datetime/display_at_created"
import { display_at_sim_datetime_reducer } from "./routing/datetime/display_at_sim_datetime"
import { routing_reducer } from "./routing/reducer"
import { search_reducer } from "./search/actions_reducer"
import { derived_meta_wcomponents_state_reducer } from "./specialised_objects/meta_wcomponents/selecting/derived"
import { specialised_objects_reducer } from "./specialised_objects/reducer"
import type { RootState } from "./State"
import { statements_reducer } from "./statements"
import { sync_reducer } from "./sync/actions_reducer"
import { backup_reducer } from "./sync/backup/actions_reducer"
import { user_activity_reducer } from "./user_activity/reducer"
import { user_info_reducer } from "./user_info/reducer"



export const root_reducer: Reducer<RootState, any> = ((state: RootState, action: AnyAction) =>
{
    const initial_state = state

    state = statements_reducer(state, action)
    state = patterns_reducer(state, action)
    state = objects_reducer(state, action)
    state = display_reducer(state, action)
    state = sync_reducer(state, action)
    state = routing_reducer(state, action)
    state = global_keys_reducer(state, action)
    state = display_at_created_datetime_reducer(state, action)
    state = display_at_sim_datetime_reducer(state, action)
    state = objectives_reducer(state, action)
    state = specialised_objects_reducer(state, action)
    state = controls_reducer(state, action)
    state = creation_context_reducer(state, action)
    state = filter_context_reducer(state, action)
    state = user_activity_reducer(state, action)
    state = user_info_reducer(state, action)
    state = backup_reducer(state, action)
    state = search_reducer(state, action)

    state = { ...state, last_action: action }

    state = derived_state_reducer(initial_state, state)
    state = derived_meta_wcomponents_state_reducer(initial_state, state)
    state = derived_filter_context_state_reducer(initial_state, state)

    // console. log (action.type, action)

    return state
})
