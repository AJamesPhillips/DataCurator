import type { HasUncertainDatetime } from "../../uncertainty/uncertainty"
import { sort_list } from "../../utils/sort"
import type { Base } from "../interfaces/base"
import { VAPsType } from "../interfaces/generic_value"
import { WComponent, wcomponent_is_action, wcomponent_is_statev2 } from "../interfaces/SpecialisedObjects"
import type {
    StateValueAndPrediction,
    WComponentStateV2SubType,
} from "../interfaces/state"
import { get_created_at_ms, partition_items_by_created_at_datetime } from "../../utils_datetime/utils_datetime"
import {
    partition_and_sort_by_uncertain_event_datetimes,
} from "../../utils_datetime/partition_by_uncertain_datetime"



interface PartitionItemsByDatetimeFuturesArgs<U>
{
    items: U[]
    created_at_ms: number
    sim_ms: number
}
interface PartitionAndPruneItemsByDatetimesAndVersionsReturn<U>
{
    invalid_future_items: U[]
    past_items: U[]
    present_items: U[]
    future_items: U[]
    previous_versions_by_id: {[id: string]: U[]}
}
export function partition_and_prune_items_by_datetimes_and_versions <U extends Base & HasUncertainDatetime> (args: PartitionItemsByDatetimeFuturesArgs<U>): PartitionAndPruneItemsByDatetimesAndVersionsReturn<U>
{
    const result = partition_items_by_created_at_datetime(args)
    const { latest, previous_versions_by_id } = group_versions_by_id(result.current_items)
    const partition_by_temporal = partition_and_sort_by_uncertain_event_datetimes({ items: latest, sim_ms: args.sim_ms })

    return {
        invalid_future_items: result.invalid_future_items,
        ...partition_by_temporal,
        previous_versions_by_id,
    }
}



interface GroupVersionsByIdReturn <U>
{
    latest: U[]
    previous_versions_by_id: {[id: string]: U[]}
}
function group_versions_by_id <U extends Base> (items: U[]): GroupVersionsByIdReturn<U>
{
    const by_id: {[id: string]: U[]} = {}
    items.forEach(item =>
    {
        const sub_items = by_id[item.id] || []
        sub_items.push(item)
        by_id[item.id] = sub_items
    })

    const previous_versions_by_id: {[id: string]: U[]} = {}
    const latest: U[] = Object.values(by_id).map(sub_items =>
    {
        const sorted = sort_list(sub_items, get_created_at_ms, "descending")

        const latest = sorted[0]!
        previous_versions_by_id[latest.id] = sorted.slice(1)

        return latest
    })

    return { latest, previous_versions_by_id }
}



export function get_VAPs_ordered_by_prob <E extends StateValueAndPrediction> (VAPs: E[], VAPs_represent: VAPsType): E[]
{
    const first_VAP = VAPs[0]
    if (VAPs_represent === VAPsType.boolean && first_VAP) return [first_VAP]

    return VAPs.sort((a, b) => a.probability > b.probability ? -1 : (a.probability < b.probability ? 1 : 0))
}



export function subtype_to_VAPsType (subtype: WComponentStateV2SubType): VAPsType
{
    return subtype === "boolean" ? VAPsType.boolean
    : (subtype === "number" ? VAPsType.number
        : (subtype === "other" ? VAPsType.other : VAPsType.undefined))
}



export function wcomponent_VAPs_represent (wcomponent: WComponent | undefined)
{
    let VAPs_represent = VAPsType.undefined

    if (wcomponent)
    {
        VAPs_represent = VAPsType.boolean
        if (wcomponent_is_statev2(wcomponent)) VAPs_represent = subtype_to_VAPsType(wcomponent.subtype)
        else if (wcomponent_is_action(wcomponent)) VAPs_represent = VAPsType.action
    }

    return VAPs_represent
}
