import { describe, test } from "../../shared/utils/test"

import type { HasUncertainDatetime } from "../../shared/uncertainty/interfaces"
import type { Base } from "../../shared/interfaces/base"
import {
    partition_items_by_created_at_datetime,
} from "../../shared/utils_datetime/utils_datetime"
import {
    partition_and_sort_by_uncertain_event_datetimes, sort_by_uncertain_event_datetimes,
} from "../../shared/utils_datetime/partition_by_uncertain_datetime"
import { group_versions_by_id } from "./group_versions_by_id"
import { StateValueAndPredictionsSet } from "../../wcomponent/interfaces/state"



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



export function prune_items_by_created_at_and_versions_and_sort_by_datetimes <U extends Base & HasUncertainDatetime> (items: U[], created_at_ms: number): U[]
{
    const latest = prune_items_by_created_at_and_versions(items, created_at_ms)
    const sorted = sort_by_uncertain_event_datetimes(latest)
    return sorted
}



export function prune_items_by_created_at_and_versions <U extends Base & HasUncertainDatetime> (items: U[], created_at_ms: number): U[]
{
    const { current_items } = partition_items_by_created_at_datetime({ items, created_at_ms })
    const { latest } = group_versions_by_id(current_items)
    return latest
}



export const test_partition_and_prune_items_by_datetimes_and_versions = describe.delay("partition_and_prune_items_by_datetimes_and_versions", () =>
{
    const dt0 = new Date("2021-04-01 00:00")
    const dt1 = new Date("2021-04-01 00:01")
    const dt2 = new Date("2021-04-01 00:02")


    function helper_func__make_VAP_sets (VAP_sets_data: Partial<StateValueAndPredictionsSet>[]): StateValueAndPredictionsSet[]
    {
        return VAP_sets_data.map((partial, index) => ({
            base_id: -1,
            id: `vps${index}`,
            created_at: dt1,
            version: 1,
            datetime: {},
            entries: [],
            ...partial,
        }))
    }

    let values_and_prediction_sets = helper_func__make_VAP_sets([
        { datetime: { value: dt0 }, id: "vap_set_0" },
        { datetime: { value: dt1 }, id: "vap_set_1" },
        { datetime: { value: dt2 }, id: "vap_set_2" },
    ])


    describe("all items created in future", () =>
    {
        const result = partition_and_prune_items_by_datetimes_and_versions({
            items: values_and_prediction_sets,
            // Remember that this means that an item is only included if its
            // created_at datetime is equal to or less than this value, so as
            // they all have dt1 which is greater than dt0 it's like we've gone
            // back in time to see the version of state of that point where
            // these vap sets were not yet created.
            created_at_ms: dt0.getTime(),
            sim_ms: dt1.getTime(),
        })

        test(result.invalid_future_items, values_and_prediction_sets, "should have all invalid future items")
        test(result.past_items, [], "should have no past items")
        test(result.present_item, undefined, "should have no present item")
        test(result.future_items, [], "should have no future items")
        test(result.previous_versions_by_id, {}, "should have empty map of previous versions")
    })


    describe("all items created in past, sim_ms in middle", () =>
    {
        const result = partition_and_prune_items_by_datetimes_and_versions({
            items: values_and_prediction_sets,
            created_at_ms: dt1.getTime(),
            sim_ms: dt1.getTime(),
        })

        test(result.invalid_future_items, [], "should have no invalid future items")
        test(result.past_items, [values_and_prediction_sets[0]], "vap_set_0 should be the one past item")
        test(result.present_item, values_and_prediction_sets[1], "vap_set_1 should be the one present item")
        test(result.future_items, [values_and_prediction_sets[2]], "vap_set_2 should be the one future item")
        test(result.previous_versions_by_id, {
            vap_set_0: [],
            vap_set_1: [],
            vap_set_2: [],
        }, "vap sets should have no previous versions")
    })

})
