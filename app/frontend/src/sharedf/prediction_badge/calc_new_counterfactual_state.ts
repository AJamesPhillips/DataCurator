import { describe, test } from "../../shared/utils/test"



interface CalcNewCounterfactualStateArgs
{
    probability: number
    conviction: number
    counterfactual_probability?: number
    counterfactual_conviction?: number
}
interface CalcNewCounterfactualStateReturn
{
    new_counterfactual_probability: number | undefined
    new_counterfactual_conviction: number | undefined
}
export function calc_new_counterfactual_state (args: CalcNewCounterfactualStateArgs): CalcNewCounterfactualStateReturn
{
    let new_counterfactual_probability: number | undefined = undefined
    let new_counterfactual_conviction: number | undefined = undefined

    const { conviction, probability, counterfactual_conviction, counterfactual_probability } = args

    const counterfactual_inactive = counterfactual_probability === undefined && counterfactual_conviction === undefined


    if (conviction !== 1)
    {
        new_counterfactual_conviction = 1
    }

    if (counterfactual_inactive && ((probability === 1 && conviction !== 1) || (probability !== 1)))
    {
        new_counterfactual_probability = 1
    }
    else if (counterfactual_probability !== 0 && ((probability === 0 && conviction !== 1) || (probability !== 0)))
    {
        new_counterfactual_probability = 0
    }
    else
    {
        new_counterfactual_probability = undefined
        new_counterfactual_conviction = undefined
    }


    return { new_counterfactual_probability, new_counterfactual_conviction }
}



export const test_calc_new_counterfactual_state = describe.delay("calc_new_counterfactual_state", () =>
{
    let probability: number
    let conviction: number
    let expected_new_counterfactual_probability: number
    let expected_new_counterfactual_conviction: number
    let result: CalcNewCounterfactualStateReturn

    // Testing when conviction is 1 and probability uncertain
    probability = 0.5
    conviction = 1
    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: undefined,
        counterfactual_conviction: undefined,
    })
    expected_new_counterfactual_probability = 1
    test(result.new_counterfactual_probability, expected_new_counterfactual_probability)
    test(result.new_counterfactual_conviction, undefined)

    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: expected_new_counterfactual_probability,
        counterfactual_conviction: undefined,
    })
    expected_new_counterfactual_probability = 0
    test(result.new_counterfactual_probability, expected_new_counterfactual_probability)
    test(result.new_counterfactual_conviction, undefined)

    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: expected_new_counterfactual_probability,
        counterfactual_conviction: undefined,
    })
    test(result.new_counterfactual_probability, undefined)
    test(result.new_counterfactual_conviction, undefined)

    // Testing when conviction is 1 and probability is 1
    probability = 1
    conviction = 1
    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: undefined,
        counterfactual_conviction: undefined,
    })
    expected_new_counterfactual_probability = 0
    test(result.new_counterfactual_probability, expected_new_counterfactual_probability)
    test(result.new_counterfactual_conviction, undefined)

    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: expected_new_counterfactual_probability,
        counterfactual_conviction: undefined,
    })
    test(result.new_counterfactual_probability, undefined)
    test(result.new_counterfactual_conviction, undefined)

    // Testing when conviction is 1 and probabilty is 0
    probability = 0
    conviction = 1
    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: undefined,
        counterfactual_conviction: undefined,
    })
    expected_new_counterfactual_probability = 1
    test(result.new_counterfactual_probability, expected_new_counterfactual_probability)
    test(result.new_counterfactual_conviction, undefined)

    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: expected_new_counterfactual_probability,
        counterfactual_conviction: undefined,
    })
    test(result.new_counterfactual_probability, undefined)
    test(result.new_counterfactual_conviction, undefined)

    // Testing when conviction is uncertain and probabilty is uncertain
    probability = 0.5
    conviction = 0.5
    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: undefined,
        counterfactual_conviction: undefined,
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
    test(result.new_counterfactual_probability, undefined)
    test(result.new_counterfactual_conviction, undefined)

    // Testing when conviction is uncertain and probabilty is 1
    probability = 1
    conviction = 0.5
    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: undefined,
        counterfactual_conviction: undefined,
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
    test(result.new_counterfactual_probability, undefined)
    test(result.new_counterfactual_conviction, undefined)

    // Testing when conviction is uncertain and probabilty is 0
    probability = 0
    conviction = 0.5
    result = calc_new_counterfactual_state({
        probability,
        conviction,
        counterfactual_probability: undefined,
        counterfactual_conviction: undefined,
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
    test(result.new_counterfactual_probability, undefined)
    test(result.new_counterfactual_conviction, undefined)

})
