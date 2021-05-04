import type {
    StateValueAndPrediction,
    StateValueAndPredictionsSet,
    VersionedStateVAPsSet,
} from "../../shared/models/interfaces/state"
import { get_today_str } from "../../shared/utils/date_helpers"
import { test } from "../../shared/utils/test"
import { get_new_value_and_prediction_set_id, get_new_VAP_id } from "../../utils/utils"



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



export function prepare_new_VAP_set (): StateValueAndPredictionsSet
{
    const now = new Date()

    return {
        id: get_new_value_and_prediction_set_id(),
        version: 1,
        created_at: now,
        custom_created_at: new Date(get_today_str()),
        datetime: { min: now },
        entries: [prepare_new_VAP()],
    }
}



export function create_new_VAP_set_version (versioned_VAP_set: VersionedStateVAPsSet)
{
    const current_latest = versioned_VAP_set.latest
    const latest = clone_VAP_set(current_latest)
    const older = [current_latest, ...versioned_VAP_set.older]
    const new_versioned_VAP_set = { latest, older }

    return new_versioned_VAP_set
}


function clone_VAP_set (VAP_set: StateValueAndPredictionsSet): StateValueAndPredictionsSet
{
    const clone = {
        ...VAP_set,
        version: VAP_set.version + 1,
        created_at: new Date(),
        entries: VAP_set.entries.map(e => ({ ...e, description: "", explanation: "" })),
    }

    delete clone.custom_created_at
    delete clone.entry_defaults

    return clone
}



export function set_VAP_probabilities (VAPs: StateValueAndPrediction[]): StateValueAndPrediction[]
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

    if (multiple)
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
    new_versioned_VAP_set = create_new_VAP_set_version(versioned_VAP_set)

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
