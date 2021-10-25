import { h } from "preact"
import { useMemo } from "preact/hooks"

import type { KnowledgeView, KnowledgeViewsById } from "../shared/interfaces/knowledge_view"
import type { ComposedKnowledgeView } from "../state/derived/State"
import { calculate_composed_knowledge_view } from "../state/specialised_objects/knowledge_views/derived_reducer"
import type { WComponentsById } from "../wcomponent/interfaces/SpecialisedObjects"
import { get_wcomponent_state_UI_value } from "../wcomponent_derived/get_wcomponent_state_UI_value"
import { get_wcomponent_state_value_and_probabilities } from "../wcomponent_derived/get_wcomponent_state_value"
import type { Simulation } from "./simulations"
import "./SimulationScenarioSummary.scss"



interface Props
{
    simulation: Simulation
    scenario_kv_id: string
    knowledge_views_by_id: KnowledgeViewsById
    wcomponents_by_id: WComponentsById
    created_at_ms: number
    sim_ms: number
}


export function SimulationScenarioSummary (props: Props)
{
    const { scenario_kv_id, knowledge_views_by_id, wcomponents_by_id, created_at_ms, sim_ms } = props
    const scenario_kv = knowledge_views_by_id[scenario_kv_id]

    if (!scenario_kv) return <div>Unknown scenario knowledge view for id: {scenario_kv_id}</div>

    const composed_kv = useMemo(() => calculate_composed_knowledge_view({
        knowledge_view: scenario_kv, knowledge_views_by_id, wcomponents_by_id
    }), [scenario_kv, knowledge_views_by_id, wcomponents_by_id])


    const get_attribute_args: GetAttributeInitialValueCommonArgs = {
        attribute_to_wc_id_map: props.simulation.attribute_to_wc_id_map,
        wcomponents_by_id,
        composed_kv,
        created_at_ms,
        sim_ms,
    }
    const retailer_initial_stock = get_attribute_initial_value("retailer_initial_stock", get_attribute_args)
    const retailer_storage = get_attribute_initial_value("retailer_storage", get_attribute_args)
    if (!retailer_initial_stock) return <div>{scenario_kv.title} missing retailer_initial_stock attribute</div>
    if (!retailer_storage) return <div>{scenario_kv.title} missing retailer_storage attribute</div>


    return <div className="scenario_summary">
        {scenario_kv.title}

        <br />
        retailer_initial_stock: {retailer_initial_stock?.parsed_value} {(retailer_initial_stock?.certainty || 1) * 100}%
        retailer_storage: {retailer_storage?.parsed_value} {(retailer_storage?.certainty || 1) * 100}%
    </div>
}



interface GetAttributeInitialValueCommonArgs
{
    attribute_to_wc_id_map: {[attribute: string]: string}
    wcomponents_by_id: WComponentsById,
    composed_kv: ComposedKnowledgeView
    created_at_ms: number
    sim_ms: number
}
function get_attribute_initial_value (attribute_name: string, args: GetAttributeInitialValueCommonArgs)
{
    const { attribute_to_wc_id_map, wcomponents_by_id, composed_kv, created_at_ms, sim_ms } = args

    const attribute_wc_id = attribute_to_wc_id_map[attribute_name] || ""
    const attribute_wcomponent = wcomponents_by_id[attribute_wc_id]
    if (!attribute_wcomponent) return false

    const wc_id_to_counterfactuals_map = composed_kv.wc_id_to_active_counterfactuals_v2_map
    const VAP_set_id_to_counterfactual_v2_map = wc_id_to_counterfactuals_map[attribute_wcomponent.id]?.VAP_sets
    const attribute_values = get_wcomponent_state_value_and_probabilities({
        wcomponent: attribute_wcomponent,
        VAP_set_id_to_counterfactual_v2_map, created_at_ms, sim_ms
    })
    const attribute_value = attribute_values.most_probable_VAP_set_values[0]

    return attribute_value
}
