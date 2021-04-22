import type { PredictionBase } from "./interfaces/uncertainty"



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
