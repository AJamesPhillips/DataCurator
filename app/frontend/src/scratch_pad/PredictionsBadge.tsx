import { h } from "preact"
import { useState } from "preact/hooks"

import { ProbablitySelection } from "../probability/ProbabililtySelection"
import { test } from "../shared/utils/test"
import { bounded } from "../utils/utils"
import { PredictionsBadgeConvictionMask } from "./PredictionsBadgeConvictionMask"



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


function PredictionsBadge (props: Props)
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



interface CalcNewCounterFactualStateArgs
{
    probability: number
    conviction: number
    counter_factual_probability?: number | null
    counter_factual_conviction?: number | null
}
interface CalcNewCounterFactualStateReturn
{
    new_counter_factual_probability: number | null | undefined
    new_counter_factual_conviction: number | null | undefined
}
function calc_new_counter_factual_state (args: CalcNewCounterFactualStateArgs): CalcNewCounterFactualStateReturn
{
    let new_counter_factual_probability: number | null | undefined = undefined
    let new_counter_factual_conviction: number | null | undefined = undefined

    const { conviction, probability, counter_factual_conviction, counter_factual_probability } = args

    if (counter_factual_conviction === undefined || counter_factual_probability === undefined)
    {
        return { new_counter_factual_probability, new_counter_factual_conviction }
    }
    const counter_factual_active = counter_factual_probability !== null || counter_factual_conviction !== null


    if (conviction !== 1)
    {
        new_counter_factual_conviction = 1
    }

    if (!counter_factual_active && ((probability === 1 && conviction !== 1) || (probability !== 1)))
    {
        new_counter_factual_probability = 1
    }
    else if (counter_factual_probability !== 0 && ((probability === 0 && conviction !== 1) || (probability !== 0)))
    {
        new_counter_factual_probability = 0
    }
    else
    {
        new_counter_factual_probability = null
        new_counter_factual_conviction = null
    }

    return { new_counter_factual_probability, new_counter_factual_conviction }
}



function run_tests ()
{
    console. log("running tests of calc_new_counter_factual_state")

    let probability: number
    let conviction: number
    let expected_new_counter_factual_probability: number
    let expected_new_counter_factual_conviction: number
    let result: CalcNewCounterFactualStateReturn

    // Providing no counter_factual values should
    // result in this producing a no-op result
    probability = 1
    conviction = 1
    result = calc_new_counter_factual_state({
        probability,
        conviction,
    })
    test(result.new_counter_factual_probability, undefined)
    test(result.new_counter_factual_conviction, undefined)

    // Only providing one counter_factual value (counter_factual_probability in this case) should still
    // result in this producing a no-op result
    result = calc_new_counter_factual_state({
        probability,
        conviction,
        counter_factual_probability: 1,
    })
    test(result.new_counter_factual_probability, undefined)
    test(result.new_counter_factual_conviction, undefined)

    // Only providing one counter_factual value (counter_factual_conviction in this case) should still
    // result in this producing a no-op result
    result = calc_new_counter_factual_state({
        probability,
        conviction,
        counter_factual_conviction: 1,
    })
    test(result.new_counter_factual_probability, undefined)
    test(result.new_counter_factual_conviction, undefined)

    // Testing when conviction is 1 and probability uncertain
    probability = 0.5
    conviction = 1
    result = calc_new_counter_factual_state({
        probability,
        conviction,
        counter_factual_probability: null,
        counter_factual_conviction: null,
    })
    expected_new_counter_factual_probability = 1
    test(result.new_counter_factual_probability, expected_new_counter_factual_probability)
    test(result.new_counter_factual_conviction, undefined)

    result = calc_new_counter_factual_state({
        probability,
        conviction,
        counter_factual_probability: expected_new_counter_factual_probability,
        counter_factual_conviction: null,
    })
    expected_new_counter_factual_probability = 0
    test(result.new_counter_factual_probability, expected_new_counter_factual_probability)
    test(result.new_counter_factual_conviction, undefined)

    result = calc_new_counter_factual_state({
        probability,
        conviction,
        counter_factual_probability: expected_new_counter_factual_probability,
        counter_factual_conviction: null,
    })
    test(result.new_counter_factual_probability, null)
    test(result.new_counter_factual_conviction, null)

    // Testing when conviction is 1 and probability is 1
    probability = 1
    conviction = 1
    result = calc_new_counter_factual_state({
        probability,
        conviction,
        counter_factual_probability: null,
        counter_factual_conviction: null,
    })
    expected_new_counter_factual_probability = 0
    test(result.new_counter_factual_probability, expected_new_counter_factual_probability)
    test(result.new_counter_factual_conviction, undefined)

    result = calc_new_counter_factual_state({
        probability,
        conviction,
        counter_factual_probability: expected_new_counter_factual_probability,
        counter_factual_conviction: null,
    })
    test(result.new_counter_factual_probability, null)
    test(result.new_counter_factual_conviction, null)

    // Testing when conviction is 1 and probabilty is 0
    probability = 0
    conviction = 1
    result = calc_new_counter_factual_state({
        probability,
        conviction,
        counter_factual_probability: null,
        counter_factual_conviction: null,
    })
    expected_new_counter_factual_probability = 1
    test(result.new_counter_factual_probability, expected_new_counter_factual_probability)
    test(result.new_counter_factual_conviction, undefined)

    result = calc_new_counter_factual_state({
        probability,
        conviction,
        counter_factual_probability: expected_new_counter_factual_probability,
        counter_factual_conviction: null,
    })
    test(result.new_counter_factual_probability, null)
    test(result.new_counter_factual_conviction, null)

    // Testing when conviction is uncertain and probabilty is uncertain
    probability = 0.5
    conviction = 0.5
    result = calc_new_counter_factual_state({
        probability,
        conviction,
        counter_factual_probability: null,
        counter_factual_conviction: null,
    })
    expected_new_counter_factual_probability = 1
    expected_new_counter_factual_conviction = 1
    test(result.new_counter_factual_probability, expected_new_counter_factual_probability)
    test(result.new_counter_factual_conviction, expected_new_counter_factual_conviction)

    result = calc_new_counter_factual_state({
        probability,
        conviction,
        counter_factual_probability: expected_new_counter_factual_probability,
        counter_factual_conviction: expected_new_counter_factual_conviction,
    })
    expected_new_counter_factual_probability = 0
    test(result.new_counter_factual_probability, expected_new_counter_factual_probability)
    test(result.new_counter_factual_conviction, expected_new_counter_factual_conviction)

    result = calc_new_counter_factual_state({
        probability,
        conviction,
        counter_factual_probability: expected_new_counter_factual_probability,
        counter_factual_conviction: expected_new_counter_factual_conviction,
    })
    test(result.new_counter_factual_probability, null)
    test(result.new_counter_factual_conviction, null)

    // Testing when conviction is uncertain and probabilty is 1
    probability = 1
    conviction = 0.5
    result = calc_new_counter_factual_state({
        probability,
        conviction,
        counter_factual_probability: null,
        counter_factual_conviction: null,
    })
    expected_new_counter_factual_probability = 1
    expected_new_counter_factual_conviction = 1
    test(result.new_counter_factual_probability, expected_new_counter_factual_probability)
    test(result.new_counter_factual_conviction, expected_new_counter_factual_conviction)

    result = calc_new_counter_factual_state({
        probability,
        conviction,
        counter_factual_probability: expected_new_counter_factual_probability,
        counter_factual_conviction: expected_new_counter_factual_conviction,
    })
    expected_new_counter_factual_probability = 0
    test(result.new_counter_factual_probability, expected_new_counter_factual_probability)
    test(result.new_counter_factual_conviction, expected_new_counter_factual_conviction)

    result = calc_new_counter_factual_state({
        probability,
        conviction,
        counter_factual_probability: expected_new_counter_factual_probability,
        counter_factual_conviction: expected_new_counter_factual_conviction,
    })
    test(result.new_counter_factual_probability, null)
    test(result.new_counter_factual_conviction, null)

    // Testing when conviction is uncertain and probabilty is 0
    probability = 0
    conviction = 0.5
    result = calc_new_counter_factual_state({
        probability,
        conviction,
        counter_factual_probability: null,
        counter_factual_conviction: null,
    })
    expected_new_counter_factual_probability = 1
    expected_new_counter_factual_conviction = 1
    test(result.new_counter_factual_probability, expected_new_counter_factual_probability)
    test(result.new_counter_factual_conviction, expected_new_counter_factual_conviction)

    result = calc_new_counter_factual_state({
        probability,
        conviction,
        counter_factual_probability: expected_new_counter_factual_probability,
        counter_factual_conviction: expected_new_counter_factual_conviction,
    })
    expected_new_counter_factual_probability = 0
    test(result.new_counter_factual_probability, expected_new_counter_factual_probability)
    test(result.new_counter_factual_conviction, expected_new_counter_factual_conviction)

    result = calc_new_counter_factual_state({
        probability,
        conviction,
        counter_factual_probability: expected_new_counter_factual_probability,
        counter_factual_conviction: expected_new_counter_factual_conviction,
    })
    test(result.new_counter_factual_probability, null)
    test(result.new_counter_factual_conviction, null)
}

// run_tests()



export function DemoPredictionsBadge ()
{
    const [probability, set_probability] = useState(1)
    const [conviction, set_conviction] = useState(1)

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

        &nbsp;&nbsp;&nbsp;<PredictionsBadge
            size={50}
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
        Conviction: {conviction}%
        <ProbablitySelection probability={conviction} set_probability={set_conviction} />
        <br />
        {/* <ConvictionSelection /> */}

    </div>
}
