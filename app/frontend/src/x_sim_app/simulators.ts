import type { ScenarioGroupRunArgs, ScenarioGroupRunResult, ScenarioRunResult } from "./scenario_run_results"



export interface BeerGameArgs
{
    retailer_initial_stock: number
    retailer_storage: number
}

export interface SimulationResult_BeerGame
{
    total_customer_demand: number
    customer_demand_fulfilled_percentage: number
    all_companies_solvent: boolean
    total_company_profit: number
}


interface Simulator<Args, Results>
{
    schedule_sim: (scenario_group_args: ScenarioGroupRunArgs, args: Args, upsert_state: (scenario_group_run_result: ScenarioGroupRunResult<Results>) => void) => void
}


let scenario_group_run = 0
export const beer_game_simulator: Simulator<BeerGameArgs, SimulationResult_BeerGame> = {
    schedule_sim: (scenario_group_args: ScenarioGroupRunArgs, args: BeerGameArgs, upsert_state: (scenario_group_run_result: ScenarioGroupRunResult<SimulationResult_BeerGame>) => void) =>
    {
        let results: ScenarioRunResult<SimulationResult_BeerGame>[] = []

        const scenario_group_run_result: ScenarioGroupRunResult<SimulationResult_BeerGame> = {
            id: `${++scenario_group_run}`,
            started: new Date(),
            ...scenario_group_args,
            total_completed: 0,
            results,
        }

        upsert_state(scenario_group_run_result)

        const upsert_result = (result: ScenarioRunResult<SimulationResult_BeerGame>) =>
        {
            results = [...results, result]
            upsert_state({
                ...scenario_group_run_result,
                total_completed: results.length,
                results,
            })
        }

        run_sims(scenario_group_run_result, args, upsert_result)
    }
}



async function run_sims (scenario_group_args: ScenarioGroupRunArgs, args: BeerGameArgs, upsert_result: (scenario_run_result: ScenarioRunResult<SimulationResult_BeerGame>) => void)
{
    const { total_to_run } = scenario_group_args

    for (let i = 0; i < total_to_run; ++i)
    {
        const result = await run_simulation__beer_game()
        upsert_result(result)
    }
}



async function run_simulation__beer_game (): Promise<ScenarioRunResult<SimulationResult_BeerGame>>
{
    return new Promise(resolve =>
    {
        setTimeout(() =>
        {
            const scenario_run_result: ScenarioRunResult<SimulationResult_BeerGame> = {
                started: new Date(),
                sim_time_seconds: 1,
                status: "complete",
                stop_reason: "end_condition",
                result: {
                    total_customer_demand: Math.round(Math.random() * 1000),
                    customer_demand_fulfilled_percentage: Math.round(Math.random() * 100),
                    all_companies_solvent: Math.random() > 0.5,
                    total_company_profit: Math.round(Math.random() * 5000000),
                },
            }

            resolve(scenario_run_result)
        }, 10)
    })
}
