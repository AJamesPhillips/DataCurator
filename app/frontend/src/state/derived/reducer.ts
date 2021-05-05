import { wcomponent_is_judgement } from "../../shared/models/interfaces/SpecialisedObjects"
import { is_defined } from "../../shared/utils/is_defined"
import { sort_list } from "../../shared/utils/sort"
import { update_substate } from "../../utils/update_state"
import { knowledge_views_derived_reducer } from "../specialised_objects/knowledge_views/derived_reducer"
import type { RootState } from "../State"
import type { WComponentIdsByType } from "./State"



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


        if (Object.keys(initial_state.specialised_objects.wcomponents_by_id).length === 0)
        {
            state = update_wcomponent_ids_by_type(state)
        }


        const judgement_ids_by_target_id = update_judgement_ids_by_target_id(state)
        state = update_substate(state, "derived", "judgement_ids_by_target_id", judgement_ids_by_target_id)
    }


    state = knowledge_views_derived_reducer(initial_state, state)


    return state
}



function update_wcomponent_ids_by_type (state: RootState)
{
    const wcomponent_ids_by_type: WComponentIdsByType = {
        event: new Set(),
        state: new Set(),
        statev2: new Set(),
        process: new Set(),
        actor: new Set(),
        causal_link: new Set(),
        relation_link: new Set(),
        judgement: new Set(),
    }

    state.derived.wcomponents.forEach(wcomponent =>
    {
        wcomponent_ids_by_type[wcomponent.type].add(wcomponent.id)
    })

    return update_substate(state, "derived", "wcomponent_ids_by_type", wcomponent_ids_by_type)
}



function update_judgement_ids_by_target_id (state: RootState)
{
    const judgement_ids_by_target_id: {[target_id: string]: string[]} = {}

    const judgement_ids = state.derived.wcomponent_ids_by_type.judgement

    Array.from(judgement_ids).map(judgement_id =>
    {
        return state.specialised_objects.wcomponents_by_id[judgement_id]
    })
    .filter(is_defined)
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
