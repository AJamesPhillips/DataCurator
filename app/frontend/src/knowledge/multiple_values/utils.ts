import type {
    StateValueAndPrediction,
    StateValueAndPredictionsSet,
    VersionedStateVAPsSet,
} from "../../shared/models/interfaces/state"
import { get_new_value_id, get_new_vap_id } from "../../utils/utils"



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


export function create_new_vap_set_version (versioned_vap_set: VersionedStateVAPsSet)
{
    const latest = clone_vap_set(versioned_vap_set.latest)
    const newest_older: StateValueAndPredictionsSet = { ...versioned_vap_set.latest, next_version_id: latest.id }
    const older = [newest_older, ...versioned_vap_set.older]
    const new_versioned_vap_set = { latest, older }

    return new_versioned_vap_set
}


function clone_vap_set (vap_set: StateValueAndPredictionsSet): StateValueAndPredictionsSet
{
    const clone = {
        ...vap_set,
        id: get_new_value_id(),
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
