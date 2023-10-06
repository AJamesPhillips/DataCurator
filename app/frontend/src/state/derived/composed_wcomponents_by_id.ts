import { update_substate } from "../../utils/update_state"
import { WComponent, wcomponent_is_statev2, wcomponent_is_state_value, WComponentsById } from "../../wcomponent/interfaces/SpecialisedObjects"
import { get_value_attributes } from "../../wcomponent/interfaces/state"
import type { RootState } from "../State"
import { get_knowledge_view_given_routing } from "./knowledge_views/get_knowledge_view_given_routing"



export function derived_composed_wcomponents_by_id_reducer (initial_state: RootState, state: RootState)
{
    const wcomponents_by_id_changed = initial_state.specialised_objects.wcomponents_by_id !== state.specialised_objects.wcomponents_by_id

    const initial_kv = get_knowledge_view_given_routing(initial_state)
    const current_kv = get_knowledge_view_given_routing(state)
    const kv_wc_id_map_changed = initial_kv?.wc_id_map !== current_kv?.wc_id_map
    const need_to_update_composed_wcomponents_by_id = wcomponents_by_id_changed || kv_wc_id_map_changed
    if (!need_to_update_composed_wcomponents_by_id) return state


    const composed_wcomponents_by_id = get_composed_wcomponents_by_id(state)
    state = update_substate(state, "derived", "composed_wcomponents_by_id", composed_wcomponents_by_id)


    return state
}



export function get_composed_wcomponents_by_id (state: RootState)
{
    const { wcomponents_by_id } = state.specialised_objects
    const composed_wcomponents_by_id: WComponentsById = {}

    const { composed_wc_id_map } = state.derived.current_composed_knowledge_view || {}

    Object.keys(composed_wc_id_map || {}).forEach(wcomponent_id =>
    {
        const wcomponent = wcomponents_by_id[wcomponent_id]
        if (!wcomponent) return

        // todo, should probably deep clone this to be more defensive
        composed_wcomponents_by_id[wcomponent_id] = { ...wcomponent }

        if (wcomponent_is_state_value(wcomponent))
        {
            const target_wcomponent = wcomponents_by_id[wcomponent.attribute_wcomponent_id || ""]
            if (!wcomponent_is_statev2(target_wcomponent)) return

            const composed_target_wcomponent: WComponent = {
                // todo, should probably deep clone these to be more defensive
                ...target_wcomponent,
                ...get_value_attributes(wcomponent),
                _derived__using_value_from_wcomponent_id: wcomponent.id,
            }

            composed_wcomponents_by_id[composed_target_wcomponent.id] = composed_target_wcomponent
        }
    })


    // TODO add in counterfactuals here and remove all that complicated code for computing the VAP sets etc

    return composed_wcomponents_by_id
}
