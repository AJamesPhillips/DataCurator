import type { AnyAction } from "redux"

import type { RootState } from "../State"
import { knowledge_views_reducer } from "./knowledge_views/reducer"
import { highlighting_reducer } from "./meta_wcomponents/highlighting"
import { perceptions_reducer } from "./perceptions/reducer"
import { syncing_reducer } from "./syncing/reducer"
import { wcomponents_reducer } from "./wcomponents/reducer"



export const specialised_objects_reducer = (state: RootState, action: AnyAction): RootState =>
{
    state = highlighting_reducer(state, action)
    state = syncing_reducer(state, action)
    state = perceptions_reducer(state, action)
    state = wcomponents_reducer(state, action)
    state = knowledge_views_reducer(state, action)

    return state
}
