import { KnowledgeViewWComponentIdEntryMap } from "../../shared/interfaces/knowledge_view"
import { sort_list, SortDirection } from "../../shared/utils/sort"
import {
    partition_items_by_created_at_datetime,
    get_created_at_ms,
} from "../../shared/utils_datetime/utils_datetime"
import {
    wcomponent_is_state_value,
    wcomponent_is_statev2,
    WComponent,
    WComponentsById,
} from "../../wcomponent/interfaces/SpecialisedObjects"
import { StateValueAndPredictionsSet } from "../../wcomponent/interfaces/state"



export function get_composed_wcomponents_by_id (args: {
    composed_visible_wc_id_map: KnowledgeViewWComponentIdEntryMap | undefined,
    wcomponents_by_id: WComponentsById,
    created_at_ms: number,
}): WComponentsById
{
    const { wcomponents_by_id, created_at_ms } = args
    // todo, should probably deep clone this to be more defensive
    const composed_wcomponents_by_id: WComponentsById = { ...wcomponents_by_id }

    Object.keys(args.composed_visible_wc_id_map || {}).forEach(wcomponent_id =>
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
