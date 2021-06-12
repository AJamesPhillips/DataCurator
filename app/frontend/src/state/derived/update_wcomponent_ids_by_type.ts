import type { WComponent } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import { update_subsubstate } from "../../utils/update_state"
import type { RootState } from "../State"


// Commenting out because this is an (as yet) UNJUSTIFIED OPTIMISATION
// export function update_wcomponent_ids_by_type_on_upserting_wcomponent (state: RootState, upserted_wcomponent: WComponent)
// {


//     const existing = state.specialised_objects.wcomponents_by_id[upserted_wcomponent.id]
//     if (existing)
//     {
//         if (existing.type !== upserted_wcomponent.type)
//         {
//             const existing_set = new Set(state.derived.wcomponent_ids_by_type[existing.type])
//             existing_set.delete(upserted_wcomponent.id)
//             state = update_subsubstate(state, "derived", "wcomponent_ids_by_type", existing.type, existing_set)
//         }
//     }


//     const set = new Set(state.derived.wcomponent_ids_by_type[upserted_wcomponent.type])
//     // if this upserted wcomponent is being updated is of a different field
//     if (set.has(upserted_wcomponent.id))
//     {
//         // No op.  This will be the case when the wcomponent already exists and a it was just
//         // that a different field (other than type) was being updated
//     }
//     else
//     {
//         set.add(upserted_wcomponent.id)
//         state = update_subsubstate(state, "derived", "wcomponent_ids_by_type", upserted_wcomponent.type, set)
//     }


//     return state
// }


// Commenting out because this is an (as yet) UNJUSTIFIED OPTIMISATION
// export function update_wcomponent_ids_by_type_on_deleting_wcomponent (state: RootState, deleted_wcomponent: WComponent)
// {
//     const set = new Set(state.derived.wcomponent_ids_by_type[deleted_wcomponent.type])
//     set.delete(deleted_wcomponent.id)
//     state = update_subsubstate(state, "derived", "wcomponent_ids_by_type", deleted_wcomponent.type, set)

//     return state
// }
