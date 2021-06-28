import { controls_persist } from "../controls/persistance"
import { creation_context_persist } from "../creation_context/persistance"
import { display_options_persist } from "../display_options/persistance"
import { filter_context_persist } from "../filter_context/persistance"
import type { RootState } from "../State"



export function persist_all_state (state: RootState)
{
    creation_context_persist(state)
    controls_persist(state)
    display_options_persist(state)
    filter_context_persist(state)
}
