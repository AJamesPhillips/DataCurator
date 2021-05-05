import { h } from "preact"
import { useState } from "preact/hooks"

import { PredictionBadge } from "../knowledge/predictions/PredictionBadge"
import { ProbablitySelection } from "../probability/ProbabililtySelection"



export function DemoPredictionsBadge ()
{
    const [probability, set_probability] = useState(1)
    const [conviction, set_conviction] = useState(1)
    const [size, set_size] = useState(50)

    const [counterfactual_probability, set_counterfactual_probability] = useState<number | undefined>(undefined)
    const [counterfactual_conviction, set_counterfactual_conviction] = useState<number | undefined>(undefined)
    function set_counterfactual (args: { probability?: number, conviction?: number })
    {
        set_counterfactual_probability(args.probability)
        set_counterfactual_conviction(args.conviction)
    }

    return <div>

        <br />

        &nbsp;&nbsp;&nbsp;<PredictionBadge
            size={size}
            probability={probability/100}
            conviction={conviction/100}
            counterfactual_probability={counterfactual_probability}
            counterfactual_conviction={counterfactual_conviction}
            set_counterfactual={set_counterfactual}
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
