import { get_items_by_id, get_multiple_items_by_id } from "../../state/specialised_objects/utils"
import { find_leaf_groups, make_graph } from "../utils/graph"
import { sort_list } from "../utils/sort"
import { WComponent, wcomponent_is_statev1, wcomponent_is_statev2 } from "./interfaces/SpecialisedObjects"
import type {
    StateValueAndPredictionsSet,
    VersionedStateVAPsSet,
    WComponentNodeState,
    WComponentNodeStateV2,
    WComponentStateV2SubType,
} from "./interfaces/state"
import type { HasDateTime, TemporalUncertainty } from "./interfaces/uncertainty"
import { get_created_at_ms, get_sim_datetime } from "./utils_datetime"



type StateValue = string | null | undefined

export function get_wcomponent_state_value (wcomponent: WComponent, created_at_ms: number, sim_ms: number): StateValue
{
    if (wcomponent_is_statev1(wcomponent)) return get_wcomponent_statev1_value(wcomponent, created_at_ms, sim_ms)
    if (wcomponent_is_statev2(wcomponent)) return get_wcomponent_statev2_value(wcomponent, created_at_ms, sim_ms)

    return undefined
}


function get_wcomponent_statev1_value (wcomponent: WComponentNodeState, created_at_ms: number, sim_ms: number): StateValue
{
    if (!wcomponent.values) return undefined // TODO remove once MVP reached

    // .values are sorted created_at ascending
    const state_value_entry = wcomponent.values.filter(v => get_created_at_ms(v) <= created_at_ms).last()

    if (!state_value_entry) return undefined

    return state_value_entry.value
}


function get_wcomponent_statev2_value (wcomponent: WComponentNodeStateV2, created_at_ms: number, sim_ms: number): StateValue
{
    return "statev2"

    let vaps = wcomponent.values_and_prediction_sets.filter(v =>
    {
        if (get_created_at_ms(v) > created_at_ms) return false

        const sim_dt = get_sim_datetime(v)
        return sim_dt ? (sim_dt.getTime() <= sim_ms) : true
    })


    // const state_value_entry = wcomponent.values_and_prediction_sets.find_last(e => {
    //     const dt = get_sim_datetime(e)
    //     if (!dt) return false
    //     // TODO
    //     return true
    // })

    // if (!state_value_entry) return undefined

    // return state_value_entry.entries.sort((a, b) => a.probability > b.probability ? -1 : 1).first()?.value
}



const get_id = (vap_set: StateValueAndPredictionsSet) => `${vap_set.id}.${vap_set.version}`
const get_head_ids = (vap_set: StateValueAndPredictionsSet) => []
const get_tail_ids = (vap_set: StateValueAndPredictionsSet) =>
{
    return (vap_set.version > 1) ? [get_id({ ...vap_set, version: vap_set.version - 1 })] : []
}

export function group_vap_sets_by_version (vap_sets: StateValueAndPredictionsSet[]): VersionedStateVAPsSet[]
{
    const graph = make_graph({ items: vap_sets, get_id, get_head_ids, get_tail_ids })

    const groups = find_leaf_groups({ graph })
    const versioned: VersionedStateVAPsSet[] = groups.map(group =>
        {
            return {
                latest: group[0],
                older: group.slice(1),
            }
        })

    return versioned
}



export function sort_grouped_vap_sets (grouped_vap_sets: VersionedStateVAPsSet[]): VersionedStateVAPsSet[]
{
    const get_sort_key = (grouped_vap_set: VersionedStateVAPsSet) =>
    {
        return get_vap_datetime_sort_key(grouped_vap_set.latest)
    }

    return sort_list(grouped_vap_sets, get_sort_key, "descending")
}



export function ungroup_vap_sets_by_version (grouped_vap_sets: VersionedStateVAPsSet[]): StateValueAndPredictionsSet[]
{
    const vap_sets: StateValueAndPredictionsSet[] = []
    grouped_vap_sets.forEach(grouped_vap_set =>
    {
        vap_sets.push(grouped_vap_set.latest, ...grouped_vap_set.older)
    })
    return vap_sets
}



export function get_latest_versions_of_vap_sets (vap_sets: StateValueAndPredictionsSet[]): VersionedStateVAPsSet[]
{
    const graph = make_graph({ items: vap_sets, get_id, get_head_ids, get_tail_ids })

    const groups = find_leaf_groups({ graph })
    const versioned: VersionedStateVAPsSet[] = groups.map(group =>
        {
            return {
                latest: group[0],
                older: group.slice(1),
            }
        })

    return versioned
}


    // // groups

    // const latest_version_vaps = values_and_predictions.filter(vap => !vap.next_version_id)

    // const ordered_latest_version_vaps = sort_list(latest_version_vaps, get_vap_datetime_sort_key, "descending")
    //     .map(vap => [vap])


function get_vap_datetime_sort_key (vap: StateValueAndPredictionsSet)
{
    const dt = get_sim_datetime(vap)
    if (dt !== undefined) return dt.getTime()
    return get_created_at_ms(vap)
}



export function get_vaps_ordered_by_prob (vap_set: StateValueAndPredictionsSet, subtype: WComponentStateV2SubType)
{
    if (subtype === "boolean") return [vap_set.entries[0]]

    return vap_set.entries.filter(e => e.probability > 0)
        .sort((a, b) => a.probability > b.probability ? -1 : (a.probability < b.probability ? 1 : 0))
}


// function get_vaps_from_set (vap_set: StateValueAndPredictionsSet, subtype: string)
// {
//     let vaps = vap_set.entries

//     if (subtype === "boolean" && vaps.length !== 1)
//     {
//         // ensure the ValueAndPrediction component always and only receives a single vap entry
//         const entries = vaps.length === 0 ? [prepare_new_vap()] : [vaps[0]]
//         return entries
//     }

//     vaps = set_vap_probabilities(vap_set.entries)

//     return vaps
// }