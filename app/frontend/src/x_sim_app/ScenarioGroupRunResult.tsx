
import { useMemo } from "preact/hooks"

import { date2str_auto } from "datacurator-core/utils/date_helpers"

import { round_number } from "../canvas/position_utils"
import type { ScenarioGroupRunResult } from "./scenario_run_results"
import "./ScenarioGroupRunResult.scss"
import type { SimulationResult_BeerGame } from "./simulators"


interface Props
{
    scenario_group_run_result: ScenarioGroupRunResult<SimulationResult_BeerGame>
}


export function ScenarioGroupRunResultComponent (props: Props)
{
    const { scenario_group_run_result: group_run } = props
    const percent_complete = as_percent(group_run.total_completed / group_run.total_to_run)
    const complete = percent_complete === 100

    const class_name = ("scenario_group_run_result "
        + (complete ? " complete " : " incomplete ")
    )


    const result_string = useMemo(() =>
    {
        if (!complete) return "Pending..."

        const { total_to_run } = group_run


        let total_sim_time = 0
        let number_solvent = 0
        let customer_demand_fulfilled_percentage = 0
        let total_company_profit = 0
        group_run.results.forEach(r =>
        {
            total_sim_time += r.sim_time_seconds
            number_solvent += (r.result.all_companies_solvent ? 1 : 0)
            customer_demand_fulfilled_percentage += r.result.customer_demand_fulfilled_percentage
            total_company_profit += r.result.total_company_profit
        })

        const total_sim_time_mean_days = round_number((total_sim_time / total_to_run) / (3600 * 24), 1)
        const percent_solvent = as_percent(number_solvent / total_to_run)
        const customer_demand_fulfilled_percentage_mean = round_number(customer_demand_fulfilled_percentage / total_to_run, 1)
        const total_company_profit_mean = round_number((total_company_profit / total_to_run), 1)


        const result_string = `Mean --- Run time (days) ${total_sim_time_mean_days} --- Solvent: ${percent_solvent}% --- Demand met: ${customer_demand_fulfilled_percentage_mean}% --- Company profit ${total_company_profit_mean}$`


        return result_string
    }, [complete])


    return <div className={class_name}>
        {date2str_auto({ date: group_run.started, time_resolution: "second" })}
        &nbsp; {percent_complete}%

        &nbsp; &nbsp;
        {result_string}
    </div>
}



function as_percent (ratio: number)
{
    return Math.round(ratio * 100)
}
