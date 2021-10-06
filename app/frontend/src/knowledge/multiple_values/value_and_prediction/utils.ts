import type {
    StateValueAndPrediction,
    StateValueAndPredictionsSet as VAPSet,
} from "../../../shared/wcomponent/interfaces/state"
import { get_new_VAP_id } from "../../../shared/utils/ids"
import { get_new_created_ats } from "../../../shared/utils/datetime"
import type { CreationContextState } from "../../../shared/creation_context/state"
import { VAPsType } from "../../../shared/wcomponent/interfaces/generic_value"
import type { ValuePossibilitiesById } from "../../../shared/wcomponent/interfaces/possibility"
import { get_possibilities_from_VAP_sets } from "../value_possibilities/get_possibilities_from_VAP_sets"



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



export function prepare_new_VAP_set_entries (VAPs_represent: VAPsType, value_possibilities: ValuePossibilitiesById | undefined, existing_VAP_sets: VAPSet[])
{
    const possibilities = get_possibilities_from_VAP_sets(VAPs_represent, value_possibilities, existing_VAP_sets)

    const vanilla_entries: StateValueAndPrediction[] = possibilities.map(possibility =>
        ({
            ...prepare_new_VAP(),
            value: possibility.value,
            value_id: possibility.id,
            description: possibility.description || "",
        })
    )
    const entries_with_probabilities = set_VAP_probabilities(vanilla_entries, VAPs_represent)

    return entries_with_probabilities
}



export function create_new_VAP_set_version (current_VAP_set: VAPSet, creation_context: CreationContextState)
{
    const clone: VAPSet = {
        ...current_VAP_set,
        ...get_new_created_ats(creation_context),
        entries: current_VAP_set.entries.map(e => ({ ...e, explanation: "" })),
        shared_entry_values: {
            ...current_VAP_set.shared_entry_values,
            explanation: undefined,
        }
    }

    return clone
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
