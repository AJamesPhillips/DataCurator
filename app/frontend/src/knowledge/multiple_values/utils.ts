import type {
    StateValueAndPrediction,
    StateValueAndPredictionsSet,
    VersionedStateVAPsSet,
} from "../../shared/models/interfaces/state"
import { test } from "../../shared/utils/test"
import { get_new_value_and_prediction_set_id, get_new_vap_id } from "../../utils/utils"



export function prepare_new_vap (): StateValueAndPrediction
{
    return {
        id: get_new_vap_id(),
        explanation: "",
        probability: 1,
        conviction: 1,
        value: "",
        description: "",
    }
}



function prepare_new_vap_set_item (): StateValueAndPredictionsSet
{
    const now = new Date()

    return {
        id: get_new_value_and_prediction_set_id(),
        version: 1,
        created_at: now,
        datetime: { value: now },
        entries: [],
    }
}



export function prepare_new_versioned_vap_set (): VersionedStateVAPsSet
{
    return {
        latest: prepare_new_vap_set_item(),
        older: [],
    }
}



export function create_new_vap_set_version (versioned_vap_set: VersionedStateVAPsSet)
{
    const current_latest = versioned_vap_set.latest
    const latest = clone_vap_set(current_latest)
    const older = [current_latest, ...versioned_vap_set.older]
    const new_versioned_vap_set = { latest, older }

    return new_versioned_vap_set
}


function clone_vap_set (vap_set: StateValueAndPredictionsSet): StateValueAndPredictionsSet
{
    const clone = {
        ...vap_set,
        version: vap_set.version + 1,
        created_at: new Date(),
        entries: vap_set.entries.map(e => ({ ...e, description: "", explanation: "" })),
    }

    delete clone.custom_created_at
    delete clone.entry_defaults

    return clone
}



export function set_vap_probabilities (vaps: StateValueAndPrediction[]): StateValueAndPrediction[]
{
    const multiple = vaps.length > 1
    let total_relative_probability = 0

    vaps = vaps.map(vap =>
    {
        const relative_probability = multiple
            ? (vap.relative_probability === undefined ? vap.probability : vap.relative_probability)
            : undefined

        if (relative_probability !== undefined) total_relative_probability += relative_probability

        return { ...vap, relative_probability }
    })

    if (multiple)
    {
        total_relative_probability = total_relative_probability || 1

        vaps = vaps.map(vap =>
        {
            const probability = vap.relative_probability! / total_relative_probability

            return { ...vap, probability }
        })
    }

    return vaps
}



function run_tests ()
{
    console. log("running tests of create_new_vap_set_version ")

    const date1 = new Date()
    let versioned_vap_set: VersionedStateVAPsSet
    let new_versioned_vap_set: VersionedStateVAPsSet

    versioned_vap_set = {
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
    new_versioned_vap_set = create_new_vap_set_version(versioned_vap_set)

    let latest = new_versioned_vap_set.latest
    test(latest.created_at.getTime() >= date1.getTime(), true)
    test({ ...latest, created_at: date1 }, {
        id: "1",
        version: 3,
        created_at: date1,
        datetime: {},
        entries: [],
    })
    test(new_versioned_vap_set.older, [versioned_vap_set.latest, ...versioned_vap_set.older])
}

// run_tests()
