import { display_persist } from "../display/persistance"
import type { RootState } from "../State"



export function persist_all_state (state: RootState)
{
    display_persist(state)
}
