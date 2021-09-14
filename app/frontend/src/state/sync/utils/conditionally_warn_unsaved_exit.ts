import type { RootState } from "../../State"
import { needs_save } from "./needs_save"
import { last_attempted_state_to_save } from "./save_state"



export function conditionally_warn_unsaved_exit (load_state_from_storage: boolean, state: RootState)
{
    if (!load_state_from_storage) return

    if (!last_attempted_state_to_save.state) return

    if (!needs_save(state, last_attempted_state_to_save.state)) return

    return true
}
