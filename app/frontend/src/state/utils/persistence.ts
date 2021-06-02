import { creation_context_persist } from "../creation_context/persistance"
import { display_options_persist } from "../display_options/persistance"
import type { RootState } from "../State"



export function persist_all_state (state: RootState)
{
    display_options_persist(state)
    creation_context_persist(state)
}
