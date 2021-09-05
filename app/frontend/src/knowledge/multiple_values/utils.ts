import type {
    StateValueAndPrediction,
    StateValueAndPredictionsSet,
    VersionedStateVAPsSet,
} from "../../shared/wcomponent/interfaces/state"
import { test } from "../../shared/utils/test"
import { get_new_value_and_prediction_set_id, get_new_VAP_id } from "../../shared/utils/ids"
import { get_new_created_ats } from "../../shared/utils/datetime"
import type { CreationContextState } from "../../shared/creation_context/state"
import { VAPsType } from "../../shared/wcomponent/interfaces/generic_value"
import { get_created_at_ms } from "../../shared/wcomponent/utils_datetime"
import { action_statuses } from "../../shared/wcomponent/interfaces/action"



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



export function prepare_new_VAP_set_entries (VAPs_represent: VAPsType, existing_VAP_sets: StateValueAndPredictionsSet[])
{
    const options = VAPs_represent === VAPsType.other ? all_options_in_VAP_set(VAPs_represent, existing_VAP_sets)
        : (VAPs_represent === VAPsType.action ? action_statuses
        : [""])
    const vanilla_entries = options.map(value => ({ ...prepare_new_VAP(), value }))
    const entries_with_probabilities = set_VAP_probabilities(vanilla_entries, VAPs_represent)

    return entries_with_probabilities
}



export function prepare_new_VAP_set (VAPs_represent: VAPsType, existing_VAP_sets: StateValueAndPredictionsSet[], creation_context: CreationContextState): StateValueAndPredictionsSet
{
    const dates = get_new_created_ats(creation_context)
    // const now = new Date(get_created_at_ms(dates))

    const entries_with_probabilities = prepare_new_VAP_set_entries(VAPs_represent, existing_VAP_sets)


    const new_VAP_set = {
        id: get_new_value_and_prediction_set_id(),
        ...dates,
        datetime: {}, // min: now },
        entries: entries_with_probabilities,
    }

    return new_VAP_set
}



function all_options_in_VAP_set (VAPs_represent: VAPsType, VAP_sets: StateValueAndPredictionsSet[])
{
    if (VAPs_represent !== VAPsType.other) return [""]

    const options: string[] = []
    const options_set: Set<string> = new Set()

    // Go in reverse order as assuming options increase over time and latest (newest) VAP_sets
    // will be added at end of list
    for (let i = (VAP_sets.length - 1); i >= 0; --i) {
        const VAP_set = VAP_sets[i]!
        VAP_set.entries.forEach(({ value }) =>
        {
            if (options_set.has(value)) return
            options.push(value)
            options_set.add(value)
        })
    }

    return options
}



export function create_new_VAP_set_version (versioned_VAP_set: VersionedStateVAPsSet, creation_context: CreationContextState)
{
    const current_latest = versioned_VAP_set.latest
    const latest = clone_VAP_set(current_latest, creation_context)
    const older = [current_latest, ...versioned_VAP_set.older]
    const new_versioned_VAP_set = { latest, older }

    return new_versioned_VAP_set
}


function clone_VAP_set (VAP_set: StateValueAndPredictionsSet, creation_context: CreationContextState): StateValueAndPredictionsSet
{
    const clone: StateValueAndPredictionsSet = {
        ...VAP_set,
        ...get_new_created_ats(creation_context),
        entries: VAP_set.entries.map(e => ({ ...e, explanation: "" })),
        shared_entry_values: {
            ...VAP_set.shared_entry_values,
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



function run_tests ()
{
    console. log("running tests of create_new_VAP_set_version ")

    const date1 = new Date()
    let versioned_VAP_set: VersionedStateVAPsSet
    let new_versioned_VAP_set: VersionedStateVAPsSet

    versioned_VAP_set = {
        latest: {
            id: "1",
            created_at: date1,
            datetime: {},
            entries: [],
        },
        older: [
            {
                id: "1",
                created_at: date1,
                datetime: {},
                entries: [],
            }
        ],
    }
    const creation_context: CreationContextState = {
        use_creation_context: false,
        creation_context: { label_ids: [] },
    }
    new_versioned_VAP_set = create_new_VAP_set_version(versioned_VAP_set, creation_context)

    let latest = new_versioned_VAP_set.latest
    test(latest.created_at.getTime() >= date1.getTime(), true)
    test({ ...latest, created_at: date1 }, {
        id: "1",
        created_at: date1,
        datetime: {},
        entries: [],
    })
    test(new_versioned_VAP_set.older, [versioned_VAP_set.latest, ...versioned_VAP_set.older])
}

// run_tests()
