import { h } from "preact"
import { useState } from "preact/hooks"

import { PredictionBadge } from "../knowledge/predictions/PredictionBadge"
import { ProbablitySelection } from "../probability/ProbabililtySelection"



export function DemoPredictionsBadge ()
{
    const [probability, set_probability] = useState(1)
    const [conviction, set_conviction] = useState(1)
    const [size, set_size] = useState(50)

    const [counter_factual_probability, set_counter_factual_probability] = useState<null | number>(null)
    const [counter_factual_conviction, set_counter_factual_conviction] = useState<null | number>(null)
    function set_counter_factual (args: { probability?: number | null, conviction?: number | null })
    {
        const { probability, conviction } = args
        probability !== undefined && set_counter_factual_probability(probability)
        conviction !== undefined && set_counter_factual_conviction(conviction)
    }

    return <div>

        <br />

        &nbsp;&nbsp;&nbsp;<PredictionBadge
            size={size}
            probability={probability/100}
            conviction={conviction/100}
            counter_factual_probability={counter_factual_probability}
            counter_factual_conviction={counter_factual_conviction}
            set_counter_factual={set_counter_factual}
        />

        <br />
        <br />

        Probability: {probability}%
        <ProbablitySelection probability={probability} set_probability={set_probability} />
        <br />
        Confidence: {conviction}%
        <ProbablitySelection probability={conviction} set_probability={set_conviction} />
        <br />
        Size: {size}
        <input
            type="range"
            min={1}
            max={100}
            value={size}
            onChange={e => set_size(parseInt(e.currentTarget.value, 10))}
        />

    </div>
}
