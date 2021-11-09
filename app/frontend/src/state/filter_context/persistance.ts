import type { FilterContextState } from "./state"
import { pick } from "../../shared/utils/pick"
import type { RootState } from "../State"
import { get_persisted_state_object, persist_state_object } from "../persistence/persistence_utils"



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

    // TODO remove code as only needed to migrate persisted state once
    if (obj.filters instanceof Array) delete obj.filters

    const {
        apply_filter = false,
        filters = {
            exclude_by_label_ids: [],
            include_by_label_ids: [],
            exclude_by_component_types: [],
            include_by_component_types: [],
        }
    } = obj


    const state: FilterContextState = {
        apply_filter,
        filters,
    }

    return state
}
