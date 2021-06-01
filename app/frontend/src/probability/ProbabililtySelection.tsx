import { h } from "preact"

import { probabilities, probabilities_plus_anchors, probability_is_in_range } from "../shared/uncertainty/probabilities"



interface OwnProps
{
    probability: number
    set_probability: (probability: number) => void
}


export function ProbablitySelection (props: OwnProps)
{
    const { probability, set_probability } = props

    return <div>
        <input
            type="range"
            min={0}
            max={100}
            value={probability}
            onChange={e => set_probability(parseFloat(e.currentTarget.value))}
            list="tickmarks_probability"
        />

        <datalist id="tickmarks_probability">
            {probabilities_plus_anchors.map(d => <option value={d}>{d}</option>)}
        </datalist>

        {probabilities.map(({ text, min, max, mean }) =>
        {
            const selected = probability_is_in_range({ min, max, probability })
            return <span
                style={{
                    backgroundColor: selected ? "blue" : "",
                    color: selected ? "white" : "",
                    border: "thin solid #aaa",
                    borderRadius: 3,
                    margin: "2px 4px",
                    padding: "2px 4px",
                    cursor: "pointer",
                }}
                onClick={() => set_probability(mean)}
            > {text} </span>
        })}
    </div>
}
