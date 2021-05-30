import type { PredictionBase } from "./interfaces/uncertainty/uncertainty"



interface ProbAndConvictionResult
{
    probability: number
    conviction: number
}

export function get_prob_and_conviction (prediction: Partial<PredictionBase> | undefined): ProbAndConvictionResult
{
    let probability = 1
    let conviction = 1

    if (prediction)
    {
        if (prediction.probability !== undefined) probability = prediction.probability
        if (prediction.conviction !== undefined) conviction = prediction.conviction
    }

    return { probability, conviction }
}



export function calc_uncertainty ({ probability, conviction }: { probability: number, conviction: number })
{
    return (probability > 0 && probability < 1) || conviction !== 1
}
