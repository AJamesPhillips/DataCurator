import { h } from "preact"

import { PredictionsBadgeConvictionMask } from "./PredictionsBadgeConvictionMask"
import { bounded } from "../../utils/utils"
import { calc_new_counter_factual_state } from "./calc_new_counter_factual_state"



interface SetCounterFactual
{
    (args: { probability?: number | null, conviction?: number | null }): void
}

interface Props
{
    size: number
    probability: number
    conviction: number
    elements_width?: 10 //| 100
    counter_factual_probability?: number | null
    counter_factual_conviction?: number | null
    set_counter_factual?: SetCounterFactual
}


export function PredictionsBadge (props: Props)
{
    const { size, elements_width = 10 } = props
    const total_elements = elements_width * elements_width
    const cell_size = size / elements_width

    const { counter_factual_probability, counter_factual_conviction, set_counter_factual } = props
    const counter_factual_active = is_num(counter_factual_probability) || is_num(counter_factual_conviction)

    const { probability: props_probability, conviction: props_conviction } = sanitise_props(props)
    const final_probability = is_num(counter_factual_probability) ? counter_factual_probability : props_probability
    const final_conviction = is_num(counter_factual_conviction) ? counter_factual_conviction : props_conviction

    function toggle_counter_factual ()
    {
        if (!set_counter_factual) return

        const result = calc_new_counter_factual_state({
            probability: props_probability,
            conviction: props_conviction,
            counter_factual_probability,
            counter_factual_conviction,
        })

        set_counter_factual({
            probability: result.new_counter_factual_probability,
            conviction: result.new_counter_factual_conviction,
        })
    }

    // const max_rnd = Math.min((1 - conviction) * 2, 1)
    // const min_rnd = Math.max((0.5 - conviction) * 2, 0)
    // const rnd_range = max_rnd - min_rnd

    const border_width = 3
    const outline_colour = counter_factual_active ? "#27dcff" : "#c8c8c8"

    return <svg
        width={size + (border_width * 2)}
        height={size + (border_width * 2)}
        onClick={() => toggle_counter_factual()}
    >
        <rect
            x={0}
            y={0}
            width={size + (border_width * 2)}
            height={size + (border_width * 2)}
            fill={outline_colour}
        />

        <g>
        {Array.from(Array(total_elements))
            .map((_, i) => {
                const i_frac = i / total_elements
                const x = i % elements_width
                const y = Math.floor(i / elements_width)

                return {
                    i, i_frac, x, y,
                    ys: border_width + (elements_width - 1 - x) * cell_size,
                    xs: border_width + (y * cell_size),
                }
            })
            // .map(e => {
            //     const f = e.i_frac < probability

            //     Math.random() >= conviction

            //     const intensity = 0.5 * 255
            //     const fill = `rgb(${intensity},${intensity},${intensity})`
            //     return <rect x={e.xs} y={e.ys} width={cell_size} height={cell_size} fill={fill} />
            // })

            .map(e => {
                // // const rnd_range_contribution = 1 - Math.abs(probability - e.i_frac)
                // // const probability_of_random = min_rnd + (rnd_range * rnd_range_contribution)
                // // const is_random = Math.random() < probability_of_random

                // const is_random = Math.random() >= conviction

                // // const certainty_if_random = Math.random()
                // // const certainty_if_random = Math.round(Math.random())
                // const certainty_if_random = 0.5

                // const certainty = is_random ? certainty_if_random : (e.f ? 0 : 1)
                const f = e.i_frac < final_probability
                const certainty = f ? 0 : 1
                const intensity = certainty * 255

                return {
                    ...e,
                    fill: `rgb(${intensity},${intensity},${intensity})`,
                }
            })
            .map(e => <rect x={e.xs} y={e.ys} width={cell_size} height={cell_size} fill={e.fill} />)
        }
        </g>

        <PredictionsBadgeConvictionMask
            size={size}
            border_width={border_width}
            elements_width={elements_width}
            conviction={final_conviction}
        />
    </svg>
}



function sanitise_props ({ probability: p_raw, conviction: c_raw }: Props) {

    const probability = bounded(p_raw, 0, 1)
    const conviction = bounded(c_raw, 0, 1)

    if (probability !== p_raw) console.error(`probability: ${p_raw} not in range 0 to 1`)
    if (conviction !== c_raw) console.error(`conviction: ${c_raw} not in range 0 to 1`)

    return { probability, conviction }
}



function is_num (num: number | null | undefined): num is number
{
    return Number.isFinite(num)
}
