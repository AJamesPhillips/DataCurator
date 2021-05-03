import type { WComponentJudgement } from "../../shared/models/interfaces/judgement"
import { wcomponent_is_judgement } from "../../shared/models/interfaces/SpecialisedObjects"
import { sort_list } from "../../shared/utils/sort"
import { update_substate } from "../../utils/update_state"
import { knowledge_views_derived_reducer } from "../specialised_objects/knowledge_views/derived_reducer"
import type { RootState } from "../State"



export function derived_state_reducer (initial_state: RootState, state: RootState)
{

    if (initial_state.specialised_objects.perceptions_by_id !== state.specialised_objects.perceptions_by_id)
    {
        const perceptions = sort_list(
            Object.values(state.specialised_objects.perceptions_by_id),
            ({ created_at }) => created_at.getTime(),
            "ascending"
        )
        state = update_substate(state, "derived", "perceptions", perceptions)
    }


    if (initial_state.specialised_objects.wcomponents_by_id !== state.specialised_objects.wcomponents_by_id)
    {
        const wcomponents = sort_list(
            Object.values(state.specialised_objects.wcomponents_by_id),
            ({ created_at }) => created_at.getTime(),
            "ascending"
        )
        state = update_substate(state, "derived", "wcomponents", wcomponents)


        const judgement_ids_by_target_id = update_judgement_ids_by_target_id(state)
        state = update_substate(state, "derived", "judgement_ids_by_target_id", judgement_ids_by_target_id)
    }

    state = knowledge_views_derived_reducer(initial_state, state)

    return state
}



function update_judgement_ids_by_target_id (state: RootState)
{
    const judgement_ids_by_target_id: {[target_id: string]: string[]} = {}

    const judgement_ids = state.derived.wcomponent_ids_by_type.judgement

    ;(Array.from(judgement_ids).map(judgement_id =>
    {
        return state.specialised_objects.wcomponents_by_id[judgement_id]
    })
    .filter(judgement => !!judgement) as WComponentJudgement[])
    .filter(wcomponent_is_judgement)
    // .sort () // some kind of sort so that front end display is stable and predictable
    .forEach(judgement =>
    {
        const target_id = judgement.judgement_target_wcomponent_id
        judgement_ids_by_target_id[target_id] = judgement_ids_by_target_id[target_id] || []
        judgement_ids_by_target_id[target_id]!.push(judgement.id)
    })

    return judgement_ids_by_target_id
}
