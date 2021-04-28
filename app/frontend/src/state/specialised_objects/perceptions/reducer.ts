import type { AnyAction } from "redux"

import type { Perception } from "../../../shared/models/interfaces/SpecialisedObjects"
import { upsert_entry, remove_from_list_by_predicate } from "../../../utils/list"
import { update_substate } from "../../../utils/update_state"
import type { RootState } from "../../State"
import { get_items_by_id } from "../../../shared/models/utils"
import { is_upsert_perception, is_delete_perception } from "./actions"



export const perceptions_reducer = (state: RootState, action: AnyAction): RootState =>
{
    const starting_perceptions = state.specialised_objects.perceptions


    if (is_upsert_perception(action))
    {
        state = handle_upsert_perception(state, action.perception)
    }


    if (is_delete_perception(action))
    {
        state = handle_delete_perception(state, action.perception_id)
    }


    if (starting_perceptions !== state.specialised_objects.perceptions)
    {
        const map = get_items_by_id(state.specialised_objects.perceptions, "perceptions")
        state = update_substate(state, "specialised_objects", "perceptions_by_id", map)
    }

    return state
}



function handle_upsert_perception (state: RootState, perception: Perception): RootState
{
    const perceptions = upsert_entry(
        state.specialised_objects.perceptions,
        perception,
        ({ id }) => id === perception.id,
        "specialised_objects.perceptions")

    return update_substate(state, "specialised_objects", "perceptions", perceptions)
}



function handle_delete_perception (state: RootState, perception_id: string): RootState
{
    const new_perceptions = remove_from_list_by_predicate(state.specialised_objects.perceptions, wc => wc.id === perception_id)

    return update_substate(state, "specialised_objects", "perceptions", new_perceptions)
}
