import type { SpecialisedObjectsFromToServer } from "../../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { RootState } from "../../State"



export function needs_save (state: RootState, last_attempted_state_to_save: RootState | undefined)
{
    return (!last_attempted_state_to_save
        || last_attempted_state_to_save.specialised_objects !== state.specialised_objects
        // state.statements !== last_saved.statements ||
        // state.patterns !== last_saved.patterns ||
        // state.objects !== last_saved.objects ||
    )
}



export function get_specialised_state_to_save (state: RootState)
{
    const specialised_state: SpecialisedObjectsFromToServer = {
        perceptions: state.derived.perceptions,
        wcomponents: state.derived.wcomponents,
        knowledge_views: state.derived.knowledge_views,
        wcomponent_ids_to_delete: state.specialised_objects.wcomponent_ids_deleted,
    }

    return specialised_state
}
