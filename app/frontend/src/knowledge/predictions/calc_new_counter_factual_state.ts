import { test } from "../../shared/utils/test"



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
export function calc_new_counter_factual_state (args: CalcNewCounterFactualStateArgs): CalcNewCounterFactualStateReturn
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
