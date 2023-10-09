import { SortDirection, sort_list } from "../../shared/utils/sort"
import { get_created_at_ms, partition_items_by_created_at_datetime } from "../../shared/utils_datetime/utils_datetime"
import { update_substate } from "../../utils/update_state"
import { WComponent, wcomponent_is_statev2, wcomponent_is_state_value, WComponentsById } from "../../wcomponent/interfaces/SpecialisedObjects"
import { StateValueAndPredictionsSet } from "../../wcomponent/interfaces/state"
import type { RootState } from "../State"
import { get_knowledge_view_given_routing } from "./knowledge_views/get_knowledge_view_given_routing"



export function derived_composed_wcomponents_by_id_reducer (initial_state: RootState, state: RootState)
{
    const wcomponents_by_id_changed = initial_state.specialised_objects.wcomponents_by_id !== state.specialised_objects.wcomponents_by_id

    // const initial_kv = get_knowledge_view_given_routing(initial_state)
    // const current_kv = get_knowledge_view_given_routing(state)
    // const kv_wc_id_map_changed = initial_kv?.wc_id_map !== current_kv?.wc_id_map

    const initial_composed_visible_wc_id_map = initial_state.derived.current_composed_knowledge_view?.composed_visible_wc_id_map
    const current_composed_visible_wc_id_map = state.derived.current_composed_knowledge_view?.composed_visible_wc_id_map
    const composed_visible_wc_id_map_changed = initial_composed_visible_wc_id_map !== current_composed_visible_wc_id_map

    const need_to_update_composed_wcomponents_by_id = (
        wcomponents_by_id_changed
        // || kv_wc_id_map_changed
        || composed_visible_wc_id_map_changed
    )
    if (!need_to_update_composed_wcomponents_by_id) return state


    const composed_wcomponents_by_id = get_composed_wcomponents_by_id(state)
    state = update_substate(state, "derived", "composed_wcomponents_by_id", composed_wcomponents_by_id)


    return state
}



function get_composed_wcomponents_by_id (state: RootState)
{
    const { wcomponents_by_id } = state.specialised_objects
    // todo, should probably deep clone this to be more defensive
    const composed_wcomponents_by_id = { ...wcomponents_by_id }

    const { composed_visible_wc_id_map } = state.derived.current_composed_knowledge_view || {}
    const { created_at_ms } = state.routing.args

    Object.keys(composed_visible_wc_id_map || {}).forEach(wcomponent_id =>
    {
        const wcomponent = wcomponents_by_id[wcomponent_id]
        if (!wcomponent) return


        if (wcomponent_is_state_value(wcomponent))
        {
            const target_wcomponent = wcomponents_by_id[wcomponent.attribute_wcomponent_id || ""]
            if (!wcomponent_is_statev2(target_wcomponent)) return

            let replacement_VAP_sets: StateValueAndPredictionsSet[] | undefined = undefined
            if (wcomponent.values_and_prediction_sets)
            {
                replacement_VAP_sets = partition_items_by_created_at_datetime({ items: wcomponent.values_and_prediction_sets, created_at_ms }).current_items
                replacement_VAP_sets = sort_list(replacement_VAP_sets, get_created_at_ms, SortDirection.descending)
            }

            const composed_target_wcomponent: WComponent = {
                // todo, should probably deep clone target_wcomponent to be more defensive
                ...target_wcomponent,
                values_and_prediction_sets: replacement_VAP_sets,
                value_possibilities: wcomponent.value_possibilities,
                _derived__using_value_from_wcomponent_id: wcomponent.id,
            }

            composed_wcomponents_by_id[composed_target_wcomponent.id] = composed_target_wcomponent
        }
    })


    // TODO add in counterfactuals here and remove all that complicated code for computing the VAP sets etc

    return composed_wcomponents_by_id
}
