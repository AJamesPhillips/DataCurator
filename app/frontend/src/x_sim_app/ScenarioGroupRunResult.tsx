import { h } from "preact"

import { date2str_auto } from "../shared/utils/date_helpers"
import type { ScenarioGroupRunResult } from "./scenario_run_results"
import "./ScenarioGroupRunResult.scss"
import type { BeerGameResults } from "./simulators"


interface Props
{
    scenario_group_run_result: ScenarioGroupRunResult<BeerGameResults>
}


export function ScenarioGroupRunResultComponent (props: Props)
{
    const { scenario_group_run_result: result } = props

    return <div className="scenario_group_run_result">
        {date2str_auto({ date: result.started, time_resolution: "second" })}
    </div>
}
