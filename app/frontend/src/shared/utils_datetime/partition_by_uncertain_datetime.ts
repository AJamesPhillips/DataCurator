import { uncertain_datetime_is_eternal } from "../uncertainty/datetime"
import type { HasUncertainDatetime } from "../uncertainty/interfaces"
import { SortDirection, sort_list } from "../utils/sort"
import { describe, test } from "../utils/test"
import { Tense } from "../../wcomponent/interfaces/datetime"
import { get_tense_of_uncertain_datetime } from "./get_tense_of_uncertain_datetime"



interface PartitionItemsByDatetimeArgs<U>
{
    items: U[]
    sim_ms: number
}
/*
 * This function:
 *   1. sorts the values by newest to oldest event
 *   2. treats the uncertain datetime as the time when the state changed
 */
export function partition_and_sort_by_uncertain_event_datetimes <U extends HasUncertainDatetime> (args: PartitionItemsByDatetimeArgs<U>): PartitionItemsByDatetimeReturn<U>
{
    const { items, sim_ms } = args

    const sorted_items = sort_by_uncertain_event_datetimes(items)

    return partition_sorted_items_by_datetimes({ sorted_items, sim_ms })
}



export function sort_by_uncertain_event_datetimes <U extends HasUncertainDatetime> (items: U[], direction = SortDirection.descending): U[]
{

    const sorted_items = sort_list(items, ({ datetime }) =>
    {
        if (uncertain_datetime_is_eternal(datetime)) return Number.NEGATIVE_INFINITY
        const { max, value, min } = datetime

        if (min) return min.getTime() * 10 + 2
        if (value) return value.getTime() * 10 + 1
        if (max) return max.getTime() * 10

        return 1
    }, direction)

    return sorted_items
}



interface PartitionSortedItemsByDatetimeArgs<U>
{
    sorted_items: U[]
    sim_ms: number
}
interface PartitionItemsByDatetimeReturn<U>
{
    past_items: U[]
    present_item: U | undefined
    future_items: U[]
}
function partition_sorted_items_by_datetimes <U extends HasUncertainDatetime> (args: PartitionSortedItemsByDatetimeArgs<U>): PartitionItemsByDatetimeReturn<U>
{
    const { sorted_items, sim_ms } = args

    let past_items: U[] = []
    let present_items: U[] = []
    let eternal_items: U[] = []
    const future_items: U[] = []


    sorted_items.forEach(item =>
    {
        const tense = get_tense_of_uncertain_datetime(item, sim_ms)

        if (tense === Tense.past) past_items.push(item)
        else if (tense === Tense.future) future_items.push(item)
        else if (tense === Tense.present) present_items.push(item)
        else eternal_items.push(item)
    })


    if (present_items.length !== 1)
    {
        if (present_items.length > 1)
        {
            const older_present_items = present_items.slice(1)
            past_items = older_present_items.concat(past_items)
            present_items = present_items.slice(0, 1)
        }
        else if (past_items.length)
        {
            present_items = past_items.slice(0, 1)
            past_items = past_items.slice(1)
        }
    }


    if (eternal_items.length)
    {
        if (present_items.length !== 1)
        {
            present_items = eternal_items.slice(0, 1)
            eternal_items = eternal_items.slice(1)
        }

        past_items = past_items.concat(eternal_items)
    }


    const present_item = present_items[0]

    return { past_items, present_item, future_items }
}



export const test_partition_sorted_items_by_datetimes = describe("partition_sorted_items_by_datetimes", () =>
{

    interface Simple extends HasUncertainDatetime { id: string }

    function helper_func__ids_partition_sorted_items_by_datetimes (args: PartitionSortedItemsByDatetimeArgs<Simple>): PartitionItemsByDatetimeReturn<string>
    {
        const result = partition_sorted_items_by_datetimes(args)
        return {
            past_items: result.past_items.map(({ id }) => id),
            present_item: result.present_item?.id,
            future_items: result.future_items.map(({ id }) => id),
        }
    }


    let sorted_items: Simple[]
    let result: PartitionItemsByDatetimeReturn<string>

    const date0 = new Date("2021-04-01 00:00")
    const date0_ms = date0.getTime()
    const date1 = new Date("2021-04-01 00:01")
    const date1_ms = date1.getTime()
    const date2 = new Date("2021-04-01 00:02")
    const date2_ms = date2.getTime()
    const date3 = new Date("2021-04-01 00:03")
    const date3_ms = date3.getTime()

    const s_eternal1: Simple = { id: "10", datetime: {} } // created_at: date1
    const s_eternal2: Simple = { id: "11", datetime: {} } // created_at: date2
    const s1: Simple = { id: "20", datetime: { value: date1 } } // created_at: date1
    const s2: Simple = { id: "30", datetime: { value: date2 } } // created_at: date1

    sorted_items = []
    result = helper_func__ids_partition_sorted_items_by_datetimes({ sorted_items, sim_ms: date3_ms })
    test(result, {
        past_items: [],
        present_item: undefined,
        future_items: [],
    })


    sorted_items = [s_eternal1, s_eternal2]
    result = helper_func__ids_partition_sorted_items_by_datetimes({ sorted_items, sim_ms: date0_ms })
    test(result, {
        past_items: [s_eternal2.id],
        present_item: s_eternal1.id,
        future_items: [],
    }, "Can handle multiple eternal elements")


    sorted_items = [s2, s1, s_eternal2]
    result = helper_func__ids_partition_sorted_items_by_datetimes({ sorted_items, sim_ms: date0_ms })
    test(result, {
        past_items: [],
        present_item: s_eternal2.id,
        future_items: [s2.id, s1.id],
    })

    result = helper_func__ids_partition_sorted_items_by_datetimes({ sorted_items, sim_ms: date1_ms })
    test(result, {
        past_items: [s_eternal2.id],
        present_item: s1.id,
        future_items: [s2.id],
    })

    result = helper_func__ids_partition_sorted_items_by_datetimes({ sorted_items, sim_ms: date2_ms })
    test(result, {
        past_items: [s1.id, s_eternal2.id],
        present_item: s2.id,
        future_items: [],
    })

    result = helper_func__ids_partition_sorted_items_by_datetimes({ sorted_items, sim_ms: date3_ms })
    test(result, {
        past_items: [s1.id, s_eternal2.id],
        present_item: s2.id,
        future_items: [],
    })

}, false)



export const test_sort_by_uncertain_event_datetimes = describe("sort_by_uncertain_event_datetimes", () =>
{

    interface Simple extends HasUncertainDatetime { id: string }

    function helper_func__ids_sort_by_uncertain_event_datetimes (items: Simple[])
    {
        const result = sort_by_uncertain_event_datetimes(items)
        return result.map(({ id }) => id)
    }


    function helper_func__compare (items: Simple[], expected: Simple[])
    {
        const items_reverse = [...items].reverse()
        const expected_ids = expected.map(({ id }) => id)

        result = helper_func__ids_sort_by_uncertain_event_datetimes(items)
        const result2 = helper_func__ids_sort_by_uncertain_event_datetimes(items_reverse)

        // Should get same result from items forwards or backwards
        test(result, result2, "", false)
        // console .log(items.map(({ id }) => id).join(", "))
        test(result, expected_ids, "", false)
    }


    let items: Simple[] = []
    let result: string[]
    let expected: Simple[]

    const date0 = new Date("2021-04-01 00:00")
    const date1 = new Date("2021-04-01 00:01")
    const date2 = new Date("2021-04-01 00:02")
    const date3 = new Date("2021-04-01 00:03")

    let id = 0
    const next_id = () => `${id++}`
    const s_eternal: Simple = { id: next_id(), datetime: {} }
    const s_eternal2: Simple = { id: next_id(), datetime: {} }
    const s1: Simple = { id: next_id(), datetime: { value: date1 } }
    const s2: Simple = { id: next_id(), datetime: { value: date2 } }
    const s_max1: Simple = { id: next_id(), datetime: { max: date1 } }
    const s_max2: Simple = { id: next_id(), datetime: { max: date2 } }
    const s_min1: Simple = { id: next_id(), datetime: { min: date1 } }
    const s_min2: Simple = { id: next_id(), datetime: { min: date2 } }

    const s_min0_max3: Simple = { id: next_id(), datetime: { min: date0, max: date3 } }
    const s_min1_max2: Simple = { id: next_id(), datetime: { min: date1, max: date2 } }


    items = []
    result = helper_func__ids_sort_by_uncertain_event_datetimes(items)
    test(result, [], "", false)


    // Not sure how to deal with multiple eternal entries so testing that sort is indeterminant for now
    items = [s_eternal, s_eternal2]
    const items_reverse = [...items].reverse()
    result = helper_func__ids_sort_by_uncertain_event_datetimes(items)
    const result2 = helper_func__ids_sort_by_uncertain_event_datetimes(items_reverse)
    test(JSON.stringify(result) !== JSON.stringify(result2), true, "Should be different (indeterminant sort)")


    items = [s_eternal, s1, s2]
    expected = [s2, s1, s_eternal]
    helper_func__compare(items, expected)


    items = [s_eternal, s_min1, s_min2]
    expected = [s_min2, s_min1, s_eternal]
    helper_func__compare(items, expected)


    items = [s_eternal, s_max1, s_max2]
    expected = [s_max2, s_max1, s_eternal]
    helper_func__compare(items, expected)


    items = [s_eternal, s1, s2, s_min1, s_min2, s_max1, s_max2]
    expected = [s_min2, s2, s_max2, s_min1, s1, s_max1, s_eternal]
    helper_func__compare(items, expected)


    items = [s_eternal, s_min0_max3, s_min1_max2]
    expected = [s_min1_max2, s_min0_max3, s_eternal]
    helper_func__compare(items, expected)

}, false)
