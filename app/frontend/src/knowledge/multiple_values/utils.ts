import type {
    StateValueAndPrediction,
    StateValueAndPredictionsSet,
    VersionedStateVAPsSet,
    WComponentStateV2SubType,
} from "../../shared/wcomponent/interfaces/state"
import { test } from "../../shared/utils/test"
import { get_new_value_and_prediction_set_id, get_new_VAP_id } from "../../shared/utils/ids"
import { get_created_ats } from "../../shared/utils/datetime"
import type { CreationContextState } from "../../shared/interfaces"



export function prepare_new_VAP (): StateValueAndPrediction
{
    return {
        id: get_new_VAP_id(),
        explanation: "",
        probability: 1,
        conviction: 1,
        value: "",
        description: "",
    }
}



export function prepare_new_VAP_set (creation_context: CreationContextState): StateValueAndPredictionsSet
{
    const now = new Date()

    return {
        id: get_new_value_and_prediction_set_id(),
        version: 1,
        ...get_created_ats(creation_context),
        datetime: { min: now },
        entries: [prepare_new_VAP()],
    }
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
        version: VAP_set.version + 1,
        ...get_created_ats(creation_context),
        entries: VAP_set.entries.map(e => ({ ...e, explanation: "" })),
        shared_entry_values: {
            ...VAP_set.shared_entry_values,
            explanation: undefined,
        }
    }

    return clone
}



export function set_VAP_probabilities (VAPs: StateValueAndPrediction[], subtype: WComponentStateV2SubType): StateValueAndPrediction[]
{
    const is_boolean = subtype === "boolean"

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

    if (multiple && !is_boolean)
    {
        total_relative_probability = total_relative_probability || 1

        VAPs = VAPs.map(VAP =>
        {
            const probability = VAP.relative_probability! / total_relative_probability

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
            version: 2,
            created_at: date1,
            datetime: {},
            entries: [],
        },
        older: [
            {
                id: "1",
                version: 1,
                created_at: date1,
                datetime: {},
                entries: [],
            }
        ],
    }
    const creation_context: CreationContextState = { use_creation_context: false, creation_context: {} }
    new_versioned_VAP_set = create_new_VAP_set_version(versioned_VAP_set, creation_context)

    let latest = new_versioned_VAP_set.latest
    test(latest.created_at.getTime() >= date1.getTime(), true)
    test({ ...latest, created_at: date1 }, {
        id: "1",
        version: 3,
        created_at: date1,
        datetime: {},
        entries: [],
    })
    test(new_versioned_VAP_set.older, [versioned_VAP_set.latest, ...versioned_VAP_set.older])
}

// run_tests()
