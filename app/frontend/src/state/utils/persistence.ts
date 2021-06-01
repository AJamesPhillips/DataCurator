import { display_persist } from "../display_options/persistance"
import type { RootState } from "../State"



export function persist_all_state (state: RootState)
{
    display_persist(state)
}
