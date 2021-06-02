import type { CreationContextState } from "../../shared/creation_context/state"
import { pick } from "../../shared/utils/pick"
import type { RootState } from "../State"
import { get_persisted_state_object, persist_state_object } from "../utils/persistence_utils"



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
    const use_creation_context = obj.use_creation_context || false
    const custom_created_at = (obj.creation_context && obj.creation_context.custom_created_at && new Date(obj.creation_context.custom_created_at)) || undefined

    const state: CreationContextState = {
        use_creation_context,
        creation_context: { custom_created_at },
    }

    return state
}
