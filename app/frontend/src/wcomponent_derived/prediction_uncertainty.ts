
interface CalcUncertaintyArgs
{
    probability: number
    conviction: number
}
export function calc_prediction_is_uncertain ({ probability, conviction }: CalcUncertaintyArgs)
{
    return (probability > 0 && probability < 1) || conviction !== 1
}



// This is not the correct implementation of certainty, because in the comment on the
// interface of `CurrentValueAndProbability`, certainty is defined as `probability * conviction`
// TODO: document why this is a different implementation or change it to match `probability * conviction`.
export function calc_prediction_certainty ({ probability, conviction }: CalcUncertaintyArgs)
{
    return Math.min(probability, conviction)
}
