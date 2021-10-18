import type { HasUncertainDatetime } from "../../shared/uncertainty/interfaces"
import { sort_list } from "../../shared/utils/sort"
import type { Base } from "../../shared/interfaces/base"
import {
    get_created_at_ms,
    partition_items_by_created_at_datetime,
} from "../../shared/utils_datetime/utils_datetime"
import {
    partition_and_sort_by_uncertain_event_datetimes, sort_by_uncertain_event_datetimes,
} from "../../shared/utils_datetime/partition_by_uncertain_datetime"
import { group_versions_by_id } from "./group_versions_by_id"



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
    present_item: U | undefined
    future_items: U[]
    previous_versions_by_id: {[id: string]: U[]}
}
export function partition_and_prune_items_by_datetimes_and_versions <U extends Base & HasUncertainDatetime> (args: PartitionItemsByDatetimeFuturesArgs<U>): PartitionAndPruneItemsByDatetimesAndVersionsReturn<U>
{
    const { invalid_future_items, current_items } = partition_items_by_created_at_datetime(args)
    const { latest, previous_versions_by_id } = group_versions_by_id(current_items)
    const partition_by_temporal = partition_and_sort_by_uncertain_event_datetimes({ items: latest, sim_ms: args.sim_ms })

    return {
        invalid_future_items,
        ...partition_by_temporal,
        previous_versions_by_id,
    }
}



export function prune_items_by_created_at_and_versions <U extends Base & HasUncertainDatetime> (items: U[], created_at_ms: number): U[]
{
    const { current_items } = partition_items_by_created_at_datetime({ items, created_at_ms })
    const { latest } = group_versions_by_id(current_items)
    return latest
}



export function prune_items_by_created_at_and_versions_and_sort_by_datetimes <U extends Base & HasUncertainDatetime> (items: U[], created_at_ms: number): U[]
{
    const latest = prune_items_by_created_at_and_versions(items, created_at_ms)
    const sorted = sort_by_uncertain_event_datetimes(latest)
    return sorted
}
