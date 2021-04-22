import { find_leaf_groups, make_graph } from "../../utils/graph"
import { sort_list } from "../../utils/sort"
import { WComponent, wcomponent_is_statev1, wcomponent_is_statev2 } from "./interfaces/SpecialisedObjects"
import type {
    StateValueAndPredictionsSet,
    VersionedStateVAPsSet,
    WComponentNodeState,
    WComponentNodeStateV2,
    WComponentStateV2SubType,
} from "./interfaces/state"
import type { TemporalUncertainty } from "./interfaces/uncertainty"
import { get_created_at } from "./utils_datetime"



export function get_wcomponent_state_value (wcomponent: WComponent): string | null | undefined
{
    if (wcomponent_is_statev1(wcomponent)) return get_wcomponent_statev1_value(wcomponent)
    if (wcomponent_is_statev2(wcomponent)) return get_wcomponent_statev2_value(wcomponent)

    return undefined
}


function get_wcomponent_statev1_value (wcomponent: WComponentNodeState): string | null | undefined
{
    if (!wcomponent.values) return undefined // TODO remove once MVP reached

    const state_value_entry = wcomponent.values.last()

    if (!state_value_entry) return undefined

    return state_value_entry.value
}


function get_wcomponent_statev2_value (wcomponent: WComponentNodeStateV2): string | null | undefined
{
    return "statev2"

    // const state_value_entry = wcomponent.values_and_prediction_sets.find_last(e => {
    //     const dt = get_sim_datetime(e)
    //     if (!dt) return false
    //     // TODO
    //     return true
    // })

    // if (!state_value_entry) return undefined

    // return state_value_entry.entries.sort((a, b) => a.probability > b.probability ? -1 : 1).first()?.value
}



const get_id = (vap_set: StateValueAndPredictionsSet) => vap_set.id
const get_head_ids = (vap_set: StateValueAndPredictionsSet) => vap_set.next_version_id ? [vap_set.next_version_id] : []
const get_tail_ids = (vap_set: StateValueAndPredictionsSet) => []

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
    return get_created_at(vap)
}



function get_sim_datetime (dt: { datetime: TemporalUncertainty })
{
    return (dt.datetime.min || dt.datetime.value || dt.datetime.max)
}



export function get_vaps_ordered_by_prob (vap_set: StateValueAndPredictionsSet, subtype: WComponentStateV2SubType)
{
    if (subtype === "boolean") return [vap_set.entries[0]]

    return vap_set.entries.filter(e => e.probability > 0)
        .sort((a, b) => a.probability > b.probability ? -1 : (a.probability < b.probability ? 1 : 0))
}
