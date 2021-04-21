import type { AnyAction } from "redux"

import { wcomponent_is_judgement } from "../../shared/models/interfaces/SpecialisedObjects"
import { update_substate } from "../../utils/update_state"
import { get_base_knowledge_view } from "../specialised_objects/accessors"
import type { RootState } from "../State"



export function derived_state_reducer (initial_state: RootState, state: RootState, action: AnyAction)
{
    if (initial_state.specialised_objects.knowledge_views !== state.specialised_objects.knowledge_views)
    {
        const {
            base_knowledge_view,
            other_knowledge_views,
        } = get_base_knowledge_view(state)

        state = {
            ...state,
            derived: {
                ...state.derived,
                base_knowledge_view,
                other_knowledge_views,
            },
        }
    }


    if (initial_state.specialised_objects.wcomponents_by_id !== state.specialised_objects.wcomponents_by_id)
    {
        const judgement_ids_by_target_id = update_judgement_ids_by_target_id(state)
        state = update_substate(state, "derived", "judgement_ids_by_target_id", judgement_ids_by_target_id)
    }

    return state
}



function update_judgement_ids_by_target_id (state: RootState)
{
    const judgement_ids_by_target_id: {[target_id: string]: string[]} = {}

    const judgement_ids = state.specialised_objects.wcomponent_ids_by_type.judgement

    Array.from(judgement_ids).map(judgement_id =>
    {
        return state.specialised_objects.wcomponents_by_id[judgement_id]
    })
    .filter(wcomponent_is_judgement)
    // .sort () // some kind of sort so that front end display is stable and predictable
    .forEach(judgement =>
    {
        const target_id = judgement.judgement_target_wcomponent_id
        judgement_ids_by_target_id[target_id] = judgement_ids_by_target_id[target_id] || []
        judgement_ids_by_target_id[target_id].push(judgement.id)
    })

    return judgement_ids_by_target_id
}
