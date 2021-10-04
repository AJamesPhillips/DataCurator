import { v4 as uuid_v4 } from "uuid"

import type {
    StateValueAndPrediction,
    StateValueAndPredictionsSet as VAPSet,
} from "../../shared/wcomponent/interfaces/state"
import { get_new_value_and_prediction_set_id, get_new_VAP_id } from "../../shared/utils/ids"
import { get_new_created_ats } from "../../shared/utils/datetime"
import type { CreationContextState } from "../../shared/creation_context/state"
import { VAPsType } from "../../shared/wcomponent/interfaces/generic_value"
import { action_statuses } from "../../shared/wcomponent/interfaces/action"
import type {
    SimpleValuePossibility,
    ValuePossibilitiesById,
    ValuePossibility,
} from "../../shared/wcomponent/interfaces/possibility"



export function prepare_new_value_possibility (existing_value_possibilities: ValuePossibilitiesById | undefined): ValuePossibility
{
    const max_order = get_max_value_possibilities_order(existing_value_possibilities)

    return {
        id: uuid_v4(),
        value: "",
        description: "",
        order: max_order + 1,
    }
}



export function get_max_value_possibilities_order (value_possibilities: SimpleValuePossibility[] | ValuePossibilitiesById | undefined): number
{
    let max_order = -1

    if (value_possibilities)
    {
        let values_array: SimpleValuePossibility[]
        if (Array.isArray(value_possibilities)) values_array = value_possibilities
        else values_array = Object.values(value_possibilities)

        values_array.forEach(({ order = -1 }) => max_order = Math.max(max_order, order))
    }

    return max_order
}



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
    const possibilities = all_options_in_VAP_set(VAPs_represent, value_possibilities, existing_VAP_sets)

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



export function prepare_new_VAP_set (VAPs_represent: VAPsType, value_possibilities: ValuePossibilitiesById | undefined, existing_VAP_sets: VAPSet[], base_id: number, creation_context: CreationContextState): VAPSet
{
    const dates = get_new_created_ats(creation_context)
    // const now = new Date(get_created_at_ms(dates))

    const entries_with_probabilities = prepare_new_VAP_set_entries(VAPs_represent, value_possibilities, existing_VAP_sets)


    const new_VAP_set = {
        id: get_new_value_and_prediction_set_id(),
        ...dates,
        base_id,
        datetime: {}, // min: now },
        entries: entries_with_probabilities,
    }

    return new_VAP_set
}



function all_options_in_VAP_set (VAPs_represent: VAPsType, value_possibilities: ValuePossibilitiesById | undefined, VAP_sets: VAPSet[]): SimpleValuePossibility[]
{
    let possibilities: SimpleValuePossibility[] = []
    const possible_value_strings: Set<string> = new Set()


    VAP_sets.forEach(VAP_set =>
    {
        VAP_set.entries.forEach(({ value, value_id }) =>
        {
            const value_possibility = value_possibilities && value_possibilities[value_id || ""]
            if (value_possibility)
            {
                possibilities.push(value_possibility)
                possible_value_strings.add(value_possibility.value)
            }
            else
            {
                if (possible_value_strings.has(value)) return
                possibilities.push({ value })
                possible_value_strings.add(value)
            }
        })
    })

    possibilities = default_possible_values(VAPs_represent, possibilities)

    return possibilities
}



export function default_possible_values (VAPs_represent: VAPsType, simple_possibilities: SimpleValuePossibility[]): ValuePossibility[]
{
    if (VAPs_represent === VAPsType.boolean)
    {
        simple_possibilities = []
    }
    else if (simple_possibilities.length === 0)
    {
        (VAPs_represent === VAPsType.action ? action_statuses : [""])
            .forEach((value, index) =>
            {
                simple_possibilities.push({ value, order: index })
            })
    }


    let max_order = get_max_value_possibilities_order(simple_possibilities)

    // Ensure all possibilities have an id, order and description
    const possibilities: ValuePossibility[] = simple_possibilities.map(possibility =>
    {
        const id = possibility.id || uuid_v4()
        const order = possibility.order ?? ++max_order
        return { description: "", ...possibility, id, order }
    })

    return possibilities
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
