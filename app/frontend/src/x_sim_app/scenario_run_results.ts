

export interface ScenarioGroupRunArgs
{
    total_to_run: number
    max_sim_time_seconds: number
}


export interface ScenarioGroupRunResult<E> extends ScenarioGroupRunArgs
{
    id: string
    started: Date
    total_completed: number

    results: ScenarioRunResult<E>[]
}



export type ScenarioRunStopReason = "time_limit" | "end_condition" | "manual"
export interface ScenarioRunResult<E>
{
    started: Date
    sim_time_seconds: number
    status: "pending" | "running" | "complete"
    stop_reason: undefined | ScenarioRunStopReason

    result: E
}
