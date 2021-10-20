import { set_difference, set_union } from "../../utils/set"
import type { RootState } from "../State"
import type { WComponentIdsByType } from "./State"



export const get_empty_wcomponent_ids_by_type = (): WComponentIdsByType => ({
    event: new Set(),
    statev2: new Set(),
    sub_state: new Set(),
    process: new Set(),
    action: new Set(),
    actor: new Set(),
    causal_link: new Set(),
    relation_link: new Set(),
    judgement: new Set(),
    objective: new Set(),
    counterfactualv2: new Set(),
    goal: new Set(),
    prioritisation: new Set(),

    judgement_or_objective: new Set(),
    any_link: new Set(),
    any_node: new Set(),
    any_state_VAPs: new Set(),
    has_single_datetime: new Set(),
})



export function get_wcomponent_ids_by_type (state: RootState, ids: string[])
{
    const wc_ids_by_type = get_empty_wcomponent_ids_by_type()

    ids.forEach(id =>
    {
        const wc = state.specialised_objects.wcomponents_by_id[id]
        if (!wc)
        {
            console.error(`Could not find wcomponent by id: ${id}`)
            return
        }

        wc_ids_by_type[wc.type].add(id)
    })

    wc_ids_by_type.judgement_or_objective = set_union(wc_ids_by_type.judgement, wc_ids_by_type.objective)
    wc_ids_by_type.any_link = set_union(wc_ids_by_type.causal_link, wc_ids_by_type.relation_link)
    wc_ids_by_type.any_node = set_difference(new Set(ids), wc_ids_by_type.any_link)
    // Need to keep in sync with wcomponent_should_have_state_VAP_sets
    wc_ids_by_type.any_state_VAPs = set_union(wc_ids_by_type.statev2,  wc_ids_by_type.causal_link, wc_ids_by_type.action)
    // Need to keep in sync with get_current_temporal_uncertainty_from_wcomponent
    wc_ids_by_type.has_single_datetime = set_union(wc_ids_by_type.event, wc_ids_by_type.sub_state)

    return wc_ids_by_type
}
