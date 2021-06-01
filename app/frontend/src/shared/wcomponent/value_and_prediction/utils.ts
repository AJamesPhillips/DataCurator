import { make_graph, find_leaf_groups } from "../../utils/graph"
import { sort_list } from "../../utils/sort"
import type { VAPsRepresent } from "../interfaces/generic_value"
import type {
    StateValueAndPredictionsSet,
    VersionedStateVAPsSet,
    StateValueAndPrediction,
    WComponentStateV2SubType,
} from "../interfaces/state"
import { get_created_at_ms, get_sim_datetime } from "../utils_datetime"



const get_id = (VAP_set: StateValueAndPredictionsSet) => `${VAP_set.id}.${VAP_set.version}`
const get_head_ids = (VAP_set: StateValueAndPredictionsSet) => []
const get_tail_ids = (VAP_set: StateValueAndPredictionsSet) =>
{
    return (VAP_set.version > 1) ? [get_id({ ...VAP_set, version: VAP_set.version - 1 })] : []
}

export function group_VAP_sets_by_version (VAP_sets: StateValueAndPredictionsSet[]): VersionedStateVAPsSet[]
{
    const graph = make_graph({ items: VAP_sets, get_id, get_head_ids, get_tail_ids })

    const groups = find_leaf_groups({ graph })
    const versioned: VersionedStateVAPsSet[] = groups.map(group =>
        {
            return {
                latest: group[0]!,
                older: group.slice(1),
            }
        })

    return versioned
}



export function sort_grouped_VAP_sets (grouped_VAP_sets: VersionedStateVAPsSet[]): VersionedStateVAPsSet[]
{
    const get_sort_key = (grouped_VAP_set: VersionedStateVAPsSet) =>
    {
        return get_VAP_datetime_sort_key(grouped_VAP_set.latest)
    }

    return sort_list(grouped_VAP_sets, get_sort_key, "descending")
}



export function ungroup_VAP_sets_by_version (grouped_VAP_sets: VersionedStateVAPsSet[]): StateValueAndPredictionsSet[]
{
    const VAP_sets: StateValueAndPredictionsSet[] = []
    grouped_VAP_sets.forEach(grouped_VAP_set =>
    {
        VAP_sets.push(grouped_VAP_set.latest, ...grouped_VAP_set.older)
    })
    return VAP_sets
}



export function get_latest_versions_of_VAP_sets (VAP_sets: StateValueAndPredictionsSet[]): VersionedStateVAPsSet[]
{
    const graph = make_graph({ items: VAP_sets, get_id, get_head_ids, get_tail_ids })

    const groups = find_leaf_groups({ graph })
    const versioned: VersionedStateVAPsSet[] = groups.map(group =>
        {
            return {
                latest: group[0]!,
                older: group.slice(1),
            }
        })

    return versioned
}


// // groups

// const latest_version_VAPs = values_and_predictions.filter(VAP => !VAP.next_version_id)

// const ordered_latest_version_VAPs = sort_list(latest_version_VAPs, get_VAP_datetime_sort_key, "descending")
//     .map(VAP => [VAP])


function get_VAP_datetime_sort_key (VAP: StateValueAndPredictionsSet)
{
    const dt = get_sim_datetime(VAP)
    if (dt !== undefined) return dt.getTime()
    return get_created_at_ms(VAP)
}



export function get_VAPs_ordered_by_prob <E extends StateValueAndPrediction> (VAPs: E[], VAPs_represents: VAPsRepresent): E[]
{
    const first_VAP = VAPs[0]
    if (VAPs_represents.boolean && first_VAP) return [first_VAP]

    return VAPs.sort((a, b) => a.probability > b.probability ? -1 : (a.probability < b.probability ? 1 : 0))
}



export function subtype_to_VAPsRepresent (subtype: WComponentStateV2SubType): VAPsRepresent
{
    return subtype === "boolean" ? { boolean: true }
    : (subtype === "number" ? { number: true } : { other: true })
}
