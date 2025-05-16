import { CreationContext } from "../../creation_context/interfaces"
import { pick } from "../../shared/utils/pick"
import type { RootState } from "../State"
import { get_persisted_state_object, persist_state_object } from "../persistence/persistence_utils"
import type { CreationContextState } from "./state"



export function creation_context_persist (state: RootState)
{
    const to_persist = pick([
        "use_creation_context",
        "creation_context",
    ], state.creation_context)

    persist_state_object("creation_context", to_persist)
}



export function creation_context_starting_state (): CreationContextState
{
    const obj = get_persisted_state_object<CreationContextState>("creation_context")
    const default_creation_context: CreationContext = { label_ids: [] }
    const {
        use_creation_context=false,
        creation_context=default_creation_context,
    } = obj

    const state: CreationContextState = {
        use_creation_context,
        creation_context,
    }

    return state
}
