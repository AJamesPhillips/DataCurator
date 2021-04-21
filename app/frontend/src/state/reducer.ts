import type { Reducer } from "preact/hooks"
import type { AnyAction } from "redux"

import { current_datetime_reducer } from "./current_datetime"
import { derived_state_reducer } from "./derived/reducer"
import { display_reducer } from "./display/reducer"
import { global_keys_reducer } from "./global_keys/reducer"
import { objectives_reducer } from "./objectives"
import { objects_reducer } from "./objects/reducer"
import { patterns_reducer } from "./patterns"
import { routing_reducer } from "./routing/reducer"
import { specialised_objects_reducer } from "./specialised_objects/reducer"
import type { RootState } from "./State"
import { statements_reducer } from "./statements"
import { sync_reducer } from "./sync"



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
    state = current_datetime_reducer(state, action)
    state = objectives_reducer(state, action)
    state = specialised_objects_reducer(state, action)

    state = { ...state, last_action: action }

    state = derived_state_reducer(initial_state, state, action)

    // console.log (action.type, action)

    return state
})
