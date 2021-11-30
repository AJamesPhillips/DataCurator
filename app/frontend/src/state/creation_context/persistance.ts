import type { CreationContextState } from "./state"
import { pick } from "../../shared/utils/pick"
import type { RootState } from "../State"
import { get_persisted_state_object, persist_state_object } from "../persistence/persistence_utils"



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
    const {
        use_creation_context = false,
        creation_context = { custom_created_at: undefined, label_ids: [] },
    } = obj

    let { custom_created_at } = creation_context
    custom_created_at = custom_created_at && new Date(custom_created_at)
    creation_context.custom_created_at = custom_created_at

    const state: CreationContextState = {
        use_creation_context,
        creation_context,
    }

    return state
}
