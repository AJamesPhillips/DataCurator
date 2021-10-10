import type {
    StateValueAndPrediction,
} from "../interfaces/state"
import { get_new_VAP_id } from "../../shared/utils/ids"
import { VAPsType } from "../interfaces/value_probabilities_etc"



export function prepare_new_VAP (): StateValueAndPrediction
{
    return {
        id: get_new_VAP_id(),
        explanation: "",
        probability: 0,
        conviction: 1,
        value: "",
        description: "",
    }
}



export function set_VAP_probabilities (VAPs: StateValueAndPrediction[], VAPs_represent: VAPsType): StateValueAndPrediction[]
{
    const multiple = VAPs.length > 1
    let total_relative_probability = 0

    VAPs = VAPs.map(VAP =>
    {
        const relative_probability = multiple
            ? (VAP.relative_probability === undefined ? VAP.probability : VAP.relative_probability)
            : undefined

        if (relative_probability !== undefined) total_relative_probability += relative_probability

        return { ...VAP, relative_probability }
    })

    if (VAPs_represent !== VAPsType.boolean)
    {
        total_relative_probability = total_relative_probability || 1

        VAPs = VAPs.map(VAP =>
        {
            const relative_probability = VAP.relative_probability === undefined ? 1 : VAP.relative_probability
            const probability = relative_probability / total_relative_probability

            return { ...VAP, probability }
        })
    }

    return VAPs
}
