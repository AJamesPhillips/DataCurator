import { set_difference, set_union } from "../../utils/set"
import {
    WComponentsById,
    wcomponent_has_legitimate_non_empty_state_VAP_sets,
    wcomponent_is_deleted,
} from "../../wcomponent/interfaces/SpecialisedObjects"
import { wcomponent_has_single_statev2_datetime } from "../specialised_objects/accessors"
import type { WComponentIdsByType } from "./State"



export function get_empty_wcomponent_ids_by_type (): WComponentIdsByType
{
    return {
        event: new Set(),
        statev2: new Set(),
        state_value: new Set(),
        multidimensional_state: new Set(),
        process: new Set(),
        action: new Set(),
        actor: new Set(),
        causal_link: new Set(),
        relation_link: new Set(),
        counterfactualv2: new Set(),

        has_objectives: new Set(),
        any_link: new Set(),
        any_node: new Set(),
        any_state_VAPs: new Set(),
        has_single_datetime: new Set(),
    }
}



export function get_wcomponent_ids_by_type (wcomponents_by_id: WComponentsById, ids: string[])
{
    const wc_ids_by_type = get_empty_wcomponent_ids_by_type()

    const wc_statev2_ids_with_single_datetime = new Set<string>()
    ids.forEach(id =>
    {
        const wc = wcomponents_by_id[id]
        if (!wc)
        {
            console.warn(`Could not find wcomponent by id: ${id}.  Wrong ID or in another project?`)
            return
        }

        if (wcomponent_is_deleted(wc)) return

        wc_ids_by_type[wc.type].add(id)
        if (wcomponent_has_legitimate_non_empty_state_VAP_sets(wc) && wcomponent_has_single_statev2_datetime(wc))
        {
            wc_statev2_ids_with_single_datetime.add(wc.id)
        }
    })

    wc_ids_by_type.any_link = set_union(wc_ids_by_type.causal_link, wc_ids_by_type.relation_link)
    wc_ids_by_type.any_node = set_difference(new Set(ids), wc_ids_by_type.any_link)
    // Need to keep in sync with wcomponent_is_allowed_to_have_state_VAP_sets
    wc_ids_by_type.any_state_VAPs = set_union(wc_ids_by_type.statev2,  wc_ids_by_type.causal_link, wc_ids_by_type.action)

    // Need to keep in sync with get_current_temporal_value_certainty_from_wcomponent
    wc_ids_by_type.has_single_datetime = set_union(wc_ids_by_type.event, wc_statev2_ids_with_single_datetime)

    return wc_ids_by_type
}
