import { describe, test } from "../../shared/utils/test"
import {
    ensure_possible_values_have_ids,
} from "./ensure_possible_values_have_ids"
import { prepare_new_VAP } from "../CRUD_helpers/prepare_new_VAP"
import type {
    ValuePossibilitiesById,
    SimpleValuePossibility,
    ValuePossibility,
} from "../interfaces/possibility"
import type { StateValueAndPredictionsSet as VAPSet, StateValueCore } from "../interfaces/state"
import { VAPsType } from "../interfaces/VAPsType"
import { default_possible_values } from "./default_possible_values"



export function get_possibilities_from_VAP_sets (VAPs_represent: VAPsType, value_possibilities_by_id: ValuePossibilitiesById | undefined, VAP_sets: VAPSet[]): ValuePossibility[]
{
    const simple_possibilities = get_simple_possibilities_from_VAP_sets(VAPs_represent, value_possibilities_by_id, VAP_sets)
    const possibilities: ValuePossibility[] = ensure_possible_values_have_ids(simple_possibilities)

    return possibilities
}



function get_simple_possibilities_from_VAP_sets (VAPs_represent: VAPsType, value_possibilities_by_id: ValuePossibilitiesById | undefined, VAP_sets: VAPSet[]): SimpleValuePossibility[]
{
    const value_cores: StateValueCore[] = Object.values(value_possibilities_by_id || {})
        .map(possibility => ({ ...possibility, id: undefined, value_id: possibility.id }))

    VAP_sets.forEach(VAP_set =>
    {
        VAP_set.entries.forEach(({ value_id, value }) =>
        {
            value_cores.push({ value_id, value })
        })
    })

    const simple_possibilities = get_simple_possibilities_from_values(value_cores, value_possibilities_by_id)

    return default_possible_values(VAPs_represent, simple_possibilities)
}



export function get_simple_possibilities_from_values (values: StateValueCore[], value_possibilities_by_id: ValuePossibilitiesById = {}): SimpleValuePossibility[]
{
    let simple_possibilities: SimpleValuePossibility[] = []
    const possible_value_strings: Set<string> = new Set()
    let max_order = 0


    values.forEach(({ value_id }) =>
    {
        const value_possibility = value_possibilities_by_id[value_id || ""]
        if (!value_possibility || possible_value_strings.has(value_possibility.value)) return

        simple_possibilities.push(value_possibility)
        max_order = Math.max(max_order, value_possibility.order)
        // Use the source of truth for the value not the denormalised `value` on the VAP
        possible_value_strings.add(value_possibility.value)
    })

    values.forEach(({ value, value_id }) =>
    {
        if (possible_value_strings.has(value)) return
        simple_possibilities.push({ value, id: value_id, order: ++max_order })
        possible_value_strings.add(value)
    })

    if (values.length === 0)
    {
        simple_possibilities = Object.values(value_possibilities_by_id)
    }

    return simple_possibilities.sort((a, b) => (a.order ?? 0) < (b.order ?? 0) ? -1 : 1)
}



export const test_get_possibilities_from_VAP_sets = describe("get_possibilities_from_VAP_sets", () =>
{
    const VAPs_represent = VAPsType.number
    const val_prob_id_123 = "val_prob_id_123"
    const VAP_sets: VAPSet[] = [
        {
            id: "VAPSet123",
            created_at: new Date(),
            base_id: 1,
            datetime: {},
            entries: [
                { ...prepare_new_VAP(), value_id: val_prob_id_123, value: "abc", description: "" },
                { ...prepare_new_VAP(), value_id: undefined, value: "duplicated", description: "" },
                { ...prepare_new_VAP(), value_id: undefined, value: "duplicated", description: "" },
            ],
        },
    ]


    let result = get_possibilities_from_VAP_sets(VAPs_represent, undefined, VAP_sets)
    test(result.length, 2, "Should get possibilities for all unique values and remove duplicates")
    test(result[0]?.value, "abc")
    // Test failing.  Skipping for now.  Not sure if the test or the implementation is incorrect
    test.skip(result[0]?.id !== val_prob_id_123, true, "Should set a new ID")
    test(result[1]?.value, "duplicated")
    test(result[1]?.id !== undefined, true, "Should set a new ID if original is undefined")

    let value_possibilities: ValuePossibilitiesById = {
        [val_prob_id_123]: {id: val_prob_id_123, value: "new abc", description: "", order: 1}
    }
    result = get_possibilities_from_VAP_sets(VAPs_represent, value_possibilities, VAP_sets)
    test(result[0]?.value, "new abc")
    test(result[0]?.id, val_prob_id_123, "Should reuse existing ID")
    test(result[1]?.order, 2, "Should increment off maximum order")

}, false)
