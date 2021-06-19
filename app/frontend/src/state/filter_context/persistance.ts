import type { FilterContextState } from "./state"
import { pick } from "../../shared/utils/pick"
import type { RootState } from "../State"
import { get_persisted_state_object, persist_state_object } from "../utils/persistence_utils"



export function filter_context_persist (state: RootState)
{
    const to_persist = pick([
        "apply_filter",
        "filters",
    ], state.filter_context)

    persist_state_object("filter_context", to_persist)
}



export function filter_context_starting_state (): FilterContextState
{
    const obj = get_persisted_state_object<FilterContextState>("filter_context")
    const apply_filter = obj.apply_filter || false
    const filters = obj.filters || []

    const state: FilterContextState = {
        apply_filter,
        filters,
    }

    return state
}
