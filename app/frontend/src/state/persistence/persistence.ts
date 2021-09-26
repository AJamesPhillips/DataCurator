import { controls_persist } from "../controls/persistance"
import { creation_context_persist } from "../creation_context/persistance"
import { display_options_persist } from "../display_options/persistance"
import { filter_context_persist } from "../filter_context/persistance"
import { search_persist } from "../search/persistance"
import type { RootState } from "../State"
import { sync_persist } from "../sync/persistance"
import { user_info_persist } from "../user_info/persistance"



export function persist_relevant_state (state: RootState)
{
    creation_context_persist(state)
    controls_persist(state)
    display_options_persist(state)
    filter_context_persist(state)
    search_persist(state)
    sync_persist(state)
    user_info_persist(state)
}
