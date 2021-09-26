import type { RootState } from "../../State"
import { needs_save } from "./needs_save"



export function conditionally_warn_unsaved_exit (load_state_from_storage: boolean, state: RootState)
{
    if (!load_state_from_storage) return

    if (!needs_save(state)) return

    return true
}
