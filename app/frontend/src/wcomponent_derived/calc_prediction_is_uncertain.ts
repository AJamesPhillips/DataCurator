
interface CalcUncertaintyArgs
{
    probability: number
    conviction: number
}
export function calc_prediction_is_uncertain ({ probability, conviction }: CalcUncertaintyArgs)
{
    return (probability > 0 && probability < 1) || conviction !== 1
}
