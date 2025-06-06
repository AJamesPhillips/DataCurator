import { useMemo, useState } from "preact/hooks"

import type { KnowledgeViewsById } from "../shared/interfaces/knowledge_view"
import { Button } from "../sharedf/Button"
import type { ComposedKnowledgeView } from "../state/derived/State"
import { calculate_composed_knowledge_view } from "../state/derived/knowledge_views/knowledge_views_derived_reducer"
import { upsert_entry } from "../utils/list"
import type { WComponentsById } from "../wcomponent/interfaces/SpecialisedObjects"
import { get_wcomponent_state_value_and_probabilities } from "../wcomponent_derived/get_wcomponent_state_value_and_probabilities"
import { ScenarioGroupRunResultComponent } from "./ScenarioGroupRunResult"
import "./SimulationScenarioSummary.scss"
import type { ScenarioGroupRunArgs, ScenarioGroupRunResult } from "./scenario_run_results"
import type { Simulation } from "./simulations"
import { BeerGameArgs, SimulationResult_BeerGame, beer_game_simulator } from "./simulators"



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

    const [scenario_group_run_results, set_scenario_group_run_results] = useState<ScenarioGroupRunResult<SimulationResult_BeerGame>[]>([])
    const upsert_scenario_group_run_results = (scenario_group_run_result: ScenarioGroupRunResult<SimulationResult_BeerGame>) =>
    {
        const new_scenario_group_run_results = upsert_entry(scenario_group_run_results, scenario_group_run_result, s => s.id === scenario_group_run_result.id)
        set_scenario_group_run_results(new_scenario_group_run_results)
    }


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


    const consumers_initial_demand = get_attribute_initial_number("consumers_initial_demand", get_attribute_args)
    const consumers_demand_increase_delay_days = get_attribute_initial_number("consumers_demand_increase_delay_days", get_attribute_args)
    const consumers_increased_demand = get_attribute_initial_number("consumers_increased_demand", get_attribute_args)
    if (!consumers_initial_demand) return <div>{scenario_kv.title} missing consumers_initial_demand attribute</div>
    if (!consumers_demand_increase_delay_days) return <div>{scenario_kv.title} missing consumers_demand_increase_delay_days attribute</div>
    if (!consumers_increased_demand) return <div>{scenario_kv.title} missing consumers_increased_demand attribute</div>


    const retailer_initial_price = get_attribute_initial_number("retailer_initial_price", get_attribute_args)
    const retailer_initial_balance = get_attribute_initial_number("retailer_initial_balance", get_attribute_args)
    const retailer_initial_stock = get_attribute_initial_number("retailer_initial_stock", get_attribute_args)
    const retailer_storage = get_attribute_initial_number("retailer_storage", get_attribute_args)
    if (!retailer_initial_price) return <div>{scenario_kv.title} missing retailer_initial_price attribute</div>
    if (!retailer_initial_balance) return <div>{scenario_kv.title} missing retailer_initial_balance attribute</div>
    if (!retailer_initial_stock) return <div>{scenario_kv.title} missing retailer_initial_stock attribute</div>
    if (!retailer_storage) return <div>{scenario_kv.title} missing retailer_storage attribute</div>


    const wholesaler_initial_price = get_attribute_initial_number("wholesaler_initial_price", get_attribute_args)
    if (!wholesaler_initial_price) return <div>{scenario_kv.title} missing wholesaler_initial_price attribute</div>


    const distributor_initial_price = get_attribute_initial_number("distributor_initial_price", get_attribute_args)
    if (!distributor_initial_price) return <div>{scenario_kv.title} missing distributor_initial_price attribute</div>


    const manufacturer_initial_price = get_attribute_initial_number("manufacturer_initial_price", get_attribute_args)
    const manufacturing_delay_in_days = get_attribute_initial_number("manufacturing_delay_in_days", get_attribute_args)
    if (!manufacturer_initial_price) return <div>{scenario_kv.title} missing manufacturer_initial_price attribute</div>
    if (!manufacturing_delay_in_days) return <div>{scenario_kv.title} missing manufacturing_delay_in_days attribute</div>


    const demand_signal_multiplier = get_attribute_initial_number("demand_signal_multiplier", get_attribute_args)
    if (!demand_signal_multiplier) return <div>{scenario_kv.title} missing demand_signal_multiplier attribute</div>
    const days_between_stock_take = get_attribute_initial_number("days_between_stock_take", get_attribute_args)
    if (!days_between_stock_take) return <div>{scenario_kv.title} missing days_between_stock_take attribute</div>
    const transport_time_in_days = get_attribute_initial_number("transport_time_in_days", get_attribute_args)
    if (!transport_time_in_days) return <div>{scenario_kv.title} missing transport_time_in_days attribute</div>


    const scenario_group_args: ScenarioGroupRunArgs = {
        total_to_run: 1,
        max_sim_time_seconds: 3600 * 24 * 365,
    }
    const beer_game_args: BeerGameArgs = {
        consumers_initial_demand: consumers_initial_demand.parsed_value,
        consumers_demand_increase_delay_days: consumers_demand_increase_delay_days.parsed_value,
        consumers_increased_demand: consumers_increased_demand.parsed_value,

        retailer_initial_price: retailer_initial_price.parsed_value,
        retailer_initial_balance: retailer_initial_balance.parsed_value,
        retailer_initial_stock: retailer_initial_stock.parsed_value,
        retailer_storage: retailer_storage.parsed_value,

        wholesaler_initial_price: wholesaler_initial_price.parsed_value,

        distributor_initial_price: distributor_initial_price.parsed_value,

        manufacturer_initial_price: manufacturer_initial_price.parsed_value,
        manufacturing_delay_in_days: manufacturing_delay_in_days.parsed_value,

        demand_signal_multiplier: demand_signal_multiplier.parsed_value,
        days_between_stock_take: days_between_stock_take.parsed_value,
        transport_time_in_days: transport_time_in_days.parsed_value,
    }


    return <div className="scenario_summary">
        {scenario_kv.title}

        <div className="simulation_run">
            <Button
                value="Run"
                onClick={() =>
                {
                    beer_game_simulator.schedule_sim(scenario_group_args, beer_game_args, upsert_scenario_group_run_results)
                }}
            />
            <Button
                value="Run x100"
                onClick={() =>
                {
                    beer_game_simulator.schedule_sim({ ...scenario_group_args, total_to_run: 100 }, beer_game_args, upsert_scenario_group_run_results)
                }}
            />
        </div>

        <br />
        retailer_initial_stock: {retailer_initial_stock.parsed_value}
        {/* {(retailer_initial_stock?.certainty || 1) * 100}% */}
        &nbsp;
        retailer_storage: {retailer_storage.parsed_value}
        {/* {(retailer_storage?.certainty || 1) * 100}% */}
        &nbsp;
        demand_signal_multiplier: {demand_signal_multiplier.parsed_value}
        {/* {(demand_signal_multiplier?.certainty || 1) * 100}% */}

        <br />
        {scenario_group_run_results.map(i => <ScenarioGroupRunResultComponent
            key={i.started.getTime()}
            scenario_group_run_result={i}
        />)}
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
function get_attribute_initial_number (attribute_name: string, args: GetAttributeInitialValueCommonArgs)
{
    const result = get_attribute_initial_value(attribute_name, args)
    if (!result) return result

    const { parsed_value } = result
    if (!Number.isFinite(parsed_value)) return false

    return { ...result, parsed_value: parsed_value as number }
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
