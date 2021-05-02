import { test } from "../../shared/utils/test"



interface CalcNewCounterfactualStateArgs
{
    probability: number
    conviction: number
    counterfactual_probability?: number | null
    counterfactual_conviction?: number | null
}
interface CalcNewCounterfactualStateReturn
{
    new_counterfactual_probability: number | null | undefined
    new_counterfactual_conviction: number | null | undefined
}
export function calc_new_counterfactual_state (args: CalcNewCounterfactualStateArgs): CalcNewCounterfactualStateReturn
{
    let new_counterfactual_probability: number | null | undefined = undefined
    let new_counterfactual_conviction: number | null | undefined = undefined

    const { conviction, probability, counterfactual_conviction, counterfactual_probability } = args

    if (counterfactual_conviction === undefined || counterfactual_probability === undefined)
    {
        return { new_counterfactual_probability: new_counterfactual_probability, new_counterfactual_conviction: new_counterfactual_conviction }
    }
    const counterfactual_active = counterfactual_probability !== null || counterfactual_conviction !== null


    if (conviction !== 1)
    {
        new_counterfactual_conviction = 1
    }

    if (!counterfactual_active && ((probability === 1 && conviction !== 1) || (probability !== 1)))
    {
        new_counterfactual_probability = 1
    }
    else if (counterfactual_probability !== 0 && ((probability === 0 && conviction !== 1) || (probability !== 0)))
    {
        new_counterfactual_probability = 0
    }
    else
    {
        new_counterfactual_probability = null
        new_counterfactual_conviction = null
    }

    return { new_counterfactual_probability, new_counterfactual_conviction }
}



function run_tests ()
{
    console. log("running tests of calc_new_counterfactual_state")

    let probability: number
    let conviction: number
    let expected_new_counterfactual_probability: number
    let expected_new_counterfactual_conviction: number
    let result: CalcNewCounterfactualStateReturn

    // Providing no counterfactual values should
    // result in this producing a no-op result
    probability = 1
    conviction = 1
    result = calc_new_counterfactual_state({
        probability,
        conviction,
    })
    test(result.new_counterfactual_probability, undefined)
    test(result.new_counterfactual_conviction, undefined)

    // Only providing one counterfactual value (counterfactual_probability in this case) should still
    // result in this producing a no-op result
    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: 1,
    })
    test(result.new_counterfactual_probability, undefined)
    test(result.new_counterfactual_conviction, undefined)

    // Only providing one counterfactual value (counterfactual_conviction in this case) should still
    // result in this producing a no-op result
    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_conviction: 1,
    })
    test(result.new_counterfactual_probability, undefined)
    test(result.new_counterfactual_conviction, undefined)

    // Testing when conviction is 1 and probability uncertain
    probability = 0.5
    conviction = 1
    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: null,
        counterfactual_conviction: null,
    })
    expected_new_counterfactual_probability = 1
    test(result.new_counterfactual_probability, expected_new_counterfactual_probability)
    test(result.new_counterfactual_conviction, undefined)

    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: expected_new_counterfactual_probability,
        counterfactual_conviction: null,
    })
    expected_new_counterfactual_probability = 0
    test(result.new_counterfactual_probability, expected_new_counterfactual_probability)
    test(result.new_counterfactual_conviction, undefined)

    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: expected_new_counterfactual_probability,
        counterfactual_conviction: null,
    })
    test(result.new_counterfactual_probability, null)
    test(result.new_counterfactual_conviction, null)

    // Testing when conviction is 1 and probability is 1
    probability = 1
    conviction = 1
    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: null,
        counterfactual_conviction: null,
    })
    expected_new_counterfactual_probability = 0
    test(result.new_counterfactual_probability, expected_new_counterfactual_probability)
    test(result.new_counterfactual_conviction, undefined)

    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: expected_new_counterfactual_probability,
        counterfactual_conviction: null,
    })
    test(result.new_counterfactual_probability, null)
    test(result.new_counterfactual_conviction, null)

    // Testing when conviction is 1 and probabilty is 0
    probability = 0
    conviction = 1
    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: null,
        counterfactual_conviction: null,
    })
    expected_new_counterfactual_probability = 1
    test(result.new_counterfactual_probability, expected_new_counterfactual_probability)
    test(result.new_counterfactual_conviction, undefined)

    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: expected_new_counterfactual_probability,
        counterfactual_conviction: null,
    })
    test(result.new_counterfactual_probability, null)
    test(result.new_counterfactual_conviction, null)

    // Testing when conviction is uncertain and probabilty is uncertain
    probability = 0.5
    conviction = 0.5
    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: null,
        counterfactual_conviction: null,
    })
    expected_new_counterfactual_probability = 1
    expected_new_counterfactual_conviction = 1
    test(result.new_counterfactual_probability, expected_new_counterfactual_probability)
    test(result.new_counterfactual_conviction, expected_new_counterfactual_conviction)

    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: expected_new_counterfactual_probability,
        counterfactual_conviction: expected_new_counterfactual_conviction,
    })
    expected_new_counterfactual_probability = 0
    test(result.new_counterfactual_probability, expected_new_counterfactual_probability)
    test(result.new_counterfactual_conviction, expected_new_counterfactual_conviction)

    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: expected_new_counterfactual_probability,
        counterfactual_conviction: expected_new_counterfactual_conviction,
    })
    test(result.new_counterfactual_probability, null)
    test(result.new_counterfactual_conviction, null)

    // Testing when conviction is uncertain and probabilty is 1
    probability = 1
    conviction = 0.5
    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: null,
        counterfactual_conviction: null,
    })
    expected_new_counterfactual_probability = 1
    expected_new_counterfactual_conviction = 1
    test(result.new_counterfactual_probability, expected_new_counterfactual_probability)
    test(result.new_counterfactual_conviction, expected_new_counterfactual_conviction)

    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: expected_new_counterfactual_probability,
        counterfactual_conviction: expected_new_counterfactual_conviction,
    })
    expected_new_counterfactual_probability = 0
    test(result.new_counterfactual_probability, expected_new_counterfactual_probability)
    test(result.new_counterfactual_conviction, expected_new_counterfactual_conviction)

    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: expected_new_counterfactual_probability,
        counterfactual_conviction: expected_new_counterfactual_conviction,
    })
    test(result.new_counterfactual_probability, null)
    test(result.new_counterfactual_conviction, null)

    // Testing when conviction is uncertain and probabilty is 0
    probability = 0
    conviction = 0.5
    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: null,
        counterfactual_conviction: null,
    })
    expected_new_counterfactual_probability = 1
    expected_new_counterfactual_conviction = 1
    test(result.new_counterfactual_probability, expected_new_counterfactual_probability)
    test(result.new_counterfactual_conviction, expected_new_counterfactual_conviction)

    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: expected_new_counterfactual_probability,
        counterfactual_conviction: expected_new_counterfactual_conviction,
    })
    expected_new_counterfactual_probability = 0
    test(result.new_counterfactual_probability, expected_new_counterfactual_probability)
    test(result.new_counterfactual_conviction, expected_new_counterfactual_conviction)

    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: expected_new_counterfactual_probability,
        counterfactual_conviction: expected_new_counterfactual_conviction,
    })
    test(result.new_counterfactual_probability, null)
    test(result.new_counterfactual_conviction, null)
}

// run_tests()
