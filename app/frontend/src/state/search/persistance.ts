import { pick } from "../../shared/utils/pick"
import type { RootState } from "../State"
import { get_persisted_state_object, persist_state_object } from "../persistence/persistence_utils"
import type { SearchState } from "./state"



export function search_persist (state: RootState)
{
    const to_persist = pick([
        "search_fields",
        "search_type",
    ], state.search)

    persist_state_object("search", to_persist)
}



export function search_starting_state (): SearchState
{
    const obj = get_persisted_state_object<SearchState>("search")

    const state: SearchState = {
        search_fields: "all",
        search_type: "best",
        ...obj,
    }

    return state
}
