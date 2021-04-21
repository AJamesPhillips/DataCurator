import { h } from "preact"
import { get_probability_option } from "../probability/probabilities"
import { ProbabilityGraph } from "../probability/ProbabilityGraph"
import { factory_scaled_weibull } from "../probability/weibulll"

import "./StatementProbability.css"


interface OwnProps
{
    probability: number
}


export function StatementProbability (props: OwnProps)
{
    const probabililty_option = get_probability_option(props.probability)
    let likelihood = "n/a"
    let calc_x
    let reverse = false
    const scale = 20
    if (probabililty_option)
    {
        const { lambda, k, text, reverse: r } = probabililty_option
        likelihood = text
        reverse = r
        calc_x = factory_scaled_weibull({ lambda, k, scale })
    }

    return <div className="statement_probability">
        <div className="top_row">
            <div>
                <div>{props.probability > 50 ? "Yes" : "No"}</div>
                <div>{props.probability}%</div>
            </div>
            <div>
                <div>{likelihood}</div>
                <div>Confident</div>
            </div>
        </div>
        <div className="bottom_row">
            {calc_x && <ProbabilityGraph calc_x={calc_x} size={scale * 4} reverse={reverse} />}
        </div>
    </div>
}