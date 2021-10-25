import type { ScenarioGroupRunArgs, ScenarioGroupRunResult } from "./scenario_run_results"



export interface BeerGameArgs
{
    retailer_initial_stock: number
    retailer_storage: number
}

export interface BeerGameResults
{
    total_customer_demand: number
    customer_demand_fulfilled_percentage: number
    all_companies_solvent: boolean
    company_profit: number
}


interface Simulator<Args, Results>
{
    schedule_sim: (scenario_group_args: ScenarioGroupRunArgs, args: Args, upsert_state: (scenario_group_run_result: ScenarioGroupRunResult<Results>) => void) => void
}


let scenario_group_run = 0
export const beer_game_simulator: Simulator<BeerGameArgs, BeerGameResults> = {
    schedule_sim: (scenario_group_args: ScenarioGroupRunArgs, args: BeerGameArgs, upsert_state: (scenario_group_run_result: ScenarioGroupRunResult<BeerGameResults>) => void) =>
    {
        const scenario_group_run_result: ScenarioGroupRunResult<BeerGameResults> = {
            id: `${++scenario_group_run}`,
            started: new Date(),
            ...scenario_group_args,
            total_completed: 0,
            results: [],
        }

        upsert_state(scenario_group_run_result)
    }
}
