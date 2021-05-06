import { test } from "../utils/test"
import type { Base } from "./interfaces/base"
import { Tense } from "./interfaces/datetime"
import type { HasDateTime } from "./interfaces/uncertainty"



export function get_created_at_ms (obj: { created_at: Date, custom_created_at?: Date }): number
{
    return (obj.custom_created_at || obj.created_at).getTime()
}



export function get_sim_datetime (item: HasDateTime)
{
    return (item.datetime.min || item.datetime.value || item.datetime.max)
}

function get_sim_datetime_ms (item: HasDateTime)
{
    const dt = get_sim_datetime(item)
    return dt === undefined ? undefined : dt.getTime()
}



function get_tense_of_item (item: HasDateTime, sim_ms: number): Tense
{
    const { min, value, max } = (item.datetime || {})

    const [have_min, min_ms] = min === undefined ? [false, 0] : [true, min.getTime()]
    const [have_value, value_ms] = value === undefined ? [false, 0] : [true, value.getTime()]
    const [have_max, max_ms] = max === undefined ? [false, 0] : [true, max.getTime()]

    if (have_min)
    {
        if (min_ms > sim_ms) return Tense.future
        if (min_ms === sim_ms) return Tense.present
        if (!have_max && min_ms < sim_ms) return Tense.present
    }

    if (have_max)
    {
        if (max_ms < sim_ms) return Tense.past
        return Tense.present
    }

    if (have_value)
    {
        if (value_ms < sim_ms) return Tense.past
        if (value_ms === sim_ms) return Tense.present
        if (value_ms > sim_ms) return Tense.future
    }

    return Tense.present // is eternal
}



interface PartitionItemsByDatetimeFuturesArgs<U>
{
    items: U[]
    created_at_ms: number
    sim_ms: number
}
interface PartitionItemsByDatetimeFuturesReturn<U>
{
    invalid_items: U[]
    past_items: U[]
    present_items: U[]
    future_items: U[]
}
function partition_items_by_datetimes <U extends Base & HasDateTime> (args: PartitionItemsByDatetimeFuturesArgs<U>): PartitionItemsByDatetimeFuturesReturn<U>
{
    const { items, created_at_ms, sim_ms } = args

    const invalid_items: U[] = []
    const past_items: U[] = []
    const present_items: U[] = []
    const future_items: U[] = []

    items.forEach(item =>
    {
        if (get_created_at_ms(item) > created_at_ms)
        {
            invalid_items.push(item)
            return
        }

        const tense = get_tense_of_item(item, sim_ms)

        if (tense === Tense.past) past_items.push(item)
        else if (tense === Tense.future) future_items.push(item)
        else present_items.push(item)
    })

    return { invalid_items, past_items, present_items, future_items }
}



function prune_present_by_temporal_and_logical_relations <U extends Base & HasDateTime> (present_items: U[]): { present: U[], past: U[] }
{
    let latest_present_datetime_ms = Number.NEGATIVE_INFINITY
    const present_items_by_ms: { [index: number]: U[] } = {}
    present_items.forEach(item =>
    {
        const ms = get_sim_datetime_ms(item)
        const ms_value = ms === undefined ? Number.NEGATIVE_INFINITY : ms
        present_items_by_ms[ms_value] = present_items_by_ms[ms_value] || []
        present_items_by_ms[ms_value]!.push(item)
        latest_present_datetime_ms = Math.max(latest_present_datetime_ms, ms_value)
    })

    const present = present_items_by_ms[latest_present_datetime_ms] || []
    const present_ids = new Set(present.map(({ id }) => id))
    const past = present_items.filter(({ id }) => !present_ids.has(id))

    return { present, past }
}



export function partition_and_prune_items_by_datetimes <U extends Base & HasDateTime> (args: PartitionItemsByDatetimeFuturesArgs<U>): PartitionItemsByDatetimeFuturesReturn<U>
{
    const result = partition_items_by_datetimes(args)
    const pruned = prune_present_by_temporal_and_logical_relations(result.present_items)

    return { ...result, present_items: pruned.present, past_items: [...pruned.past, ...result.past_items] }
}



function test_get_tense_of_item ()
{
    console .log("running tests of get_tense_of_item")

    let result: Tense

    const date1 = new Date("2021-04-01 00:01")
    const date1_ms = date1.getTime()
    const date2 = new Date("2021-04-01 00:02")
    const date2_ms = date2.getTime()
    const date3 = new Date("2021-04-01 00:03")
    const date3_ms = date3.getTime()
    const date4 = new Date("2021-04-01 00:04")
    const date4_ms = date4.getTime()
    const date5 = new Date("2021-04-01 00:05")
    const date5_ms = date5.getTime()

    result = get_tense_of_item({ datetime: {} }, date1_ms)
    test(result, Tense.present)

    result = get_tense_of_item({ datetime: { min: date2 } }, date1_ms)
    test(result, Tense.future)
    result = get_tense_of_item({ datetime: { min: date2 } }, date2_ms)
    test(result, Tense.present)
    result = get_tense_of_item({ datetime: { min: date2 } }, date3_ms)
    test(result, Tense.present)

    result = get_tense_of_item({ datetime: { value: date2 } }, date1_ms)
    test(result, Tense.future)
    result = get_tense_of_item({ datetime: { value: date2 } }, date2_ms)
    test(result, Tense.present)
    result = get_tense_of_item({ datetime: { value: date2 } }, date3_ms)
    test(result, Tense.past)

    result = get_tense_of_item({ datetime: { max: date2 } }, date1_ms)
    test(result, Tense.present)
    result = get_tense_of_item({ datetime: { max: date2 } }, date2_ms)
    test(result, Tense.present)
    result = get_tense_of_item({ datetime: { max: date2 } }, date3_ms)
    test(result, Tense.past)


    result = get_tense_of_item({ datetime: { min: date2, max: date3 } }, date1_ms)
    test(result, Tense.future)
    result = get_tense_of_item({ datetime: { min: date2, max: date3 } }, date2_ms)
    test(result, Tense.present)
    result = get_tense_of_item({ datetime: { min: date2, max: date3 } }, date3_ms)
    test(result, Tense.present)
    result = get_tense_of_item({ datetime: { min: date2, max: date3 } }, date4_ms)
    test(result, Tense.past)

    result = get_tense_of_item({ datetime: { min: date2, value: date3, max: date4 } }, date1_ms)
    test(result, Tense.future)
    result = get_tense_of_item({ datetime: { min: date2, value: date3, max: date4 } }, date2_ms)
    test(result, Tense.present)
    result = get_tense_of_item({ datetime: { min: date2, value: date3, max: date4 } }, date3_ms)
    test(result, Tense.present)
    result = get_tense_of_item({ datetime: { min: date2, value: date3, max: date4 } }, date4_ms)
    test(result, Tense.present)
    result = get_tense_of_item({ datetime: { min: date2, value: date3, max: date4 } }, date5_ms)
    test(result, Tense.past)
}



function test_partition_items_by_datetimes ()
{
    console .log("running tests of partition_items_by_datetimes")

    interface Simple extends Base, HasDateTime {}

    function ids_partition_items_by_datetimes (args: PartitionItemsByDatetimeFuturesArgs<Simple>): PartitionItemsByDatetimeFuturesReturn<string>
    {
        const result = partition_items_by_datetimes(args)
        return {
            invalid_items: result.invalid_items.map(({ id }) => id),
            past_items: result.past_items.map(({ id }) => id),
            present_items: result.present_items.map(({ id }) => id),
            future_items: result.future_items.map(({ id }) => id),
        }
    }

    let items: Simple[]
    let result: PartitionItemsByDatetimeFuturesReturn<string>

    const date1 = new Date("2021-04-01 00:01")
    const date1_ms = date1.getTime()
    const date2 = new Date("2021-04-01 00:02")
    const date2_ms = date2.getTime()
    const date3 = new Date("2021-04-01 00:03")
    const date3_ms = date3.getTime()

    const c1s1 = { id: "1", created_at: date1, datetime: { value: date1 } }
    const c1s2 = { id: "2", created_at: date1, datetime: { value: date2 } }
    const c2s1 = { id: "3", created_at: date2, datetime: { value: date1 } }
    const c2s2 = { id: "4", created_at: date2, datetime: { value: date2 } }
    const c2se = { id: "5", created_at: date2, datetime: {} }

    items = []
    result = ids_partition_items_by_datetimes({ items, created_at_ms: date3_ms, sim_ms: date3_ms })
    test(result, {
        invalid_items: [],
        past_items: [],
        present_items: [],
        future_items: [],
    })

    items = [c1s1, c1s2, c2s1, c2s2, c2se]
    result = ids_partition_items_by_datetimes({ items, created_at_ms: date3_ms, sim_ms: date3_ms })
    test(result, {
        invalid_items: [],
        past_items: [c1s1.id, c1s2.id, c2s1.id, c2s2.id],
        present_items: [c2se.id],
        future_items: [],
    })

    result = ids_partition_items_by_datetimes({ items, created_at_ms: date3_ms, sim_ms: date1_ms })
    test(result, {
        invalid_items: [],
        past_items: [],
        present_items: [c1s1.id, c2s1.id, c2se.id],
        future_items: [c1s2.id, c2s2.id],
    })

    result = ids_partition_items_by_datetimes({ items, created_at_ms: date1_ms, sim_ms: date3_ms })
    test(result, {
        invalid_items: [c2s1.id, c2s2.id, c2se.id],
        past_items: [c1s1.id, c1s2.id],
        present_items: [],
        future_items: [],
    })

    result = ids_partition_items_by_datetimes({ items, created_at_ms: date1_ms, sim_ms: date1_ms })
    test(result, {
        invalid_items: [c2s1.id, c2s2.id, c2se.id],
        past_items: [],
        present_items: [c1s1.id],
        future_items: [c1s2.id],
    })
}



function test_prune_present_by_temporal_and_logical_relations ()
{
    console .log("running tests of prune_present_by_temporal_and_logical_relations")

    interface Simple extends Base, HasDateTime {}

    function ids_prune_present_by_temporal_and_logical_relations (present: Simple[])
    {
        const result = prune_present_by_temporal_and_logical_relations(present)

        return {
            past: result.past.map(({ id }) => id),
            present: result.present.map(({ id }) => id),
        }
    }

    let items: Simple[]
    let result: { present: string[], past: string[] }

    const date1 = new Date("2021-04-01 00:01")
    const date2 = new Date("2021-04-01 00:02")

    const c1s1 = { id: "1", created_at: date1, datetime: { value: date1 } }
    const c1s2 = { id: "2", created_at: date1, datetime: { value: date2 } }
    const c2s1 = { id: "3", created_at: date2, datetime: { value: date1 } }
    const c2s2 = { id: "4", created_at: date2, datetime: { value: date2 } }
    const c2se = { id: "5", created_at: date2, datetime: {} }
    const c2se2 = { id: "6", created_at: date2, datetime: {} }

    items = []
    result = ids_prune_present_by_temporal_and_logical_relations(items)
    test(result, {
        past: [],
        present: [],
    })

    items = [c1s1, c1s2, c2s1, c2s2, c2se, c2se2]
    result = ids_prune_present_by_temporal_and_logical_relations(items)
    test(result, {
        past: [c1s1.id, c2s1.id, c2se.id, c2se2.id],
        // Specific entries should take precedence over eternal entries
        present: [c1s2.id, c2s2.id],
    })

    items = [c1s1, c1s2, c2s1, c2s2]
    result = ids_prune_present_by_temporal_and_logical_relations(items)
    test(result, {
        past: [c1s1.id, c2s1.id],
        present: [c1s2.id, c2s2.id],
    })
}



function test_partition_and_prune_items_by_datetimes ()
{
    console .log("running tests of partition_and_prune_items_by_datetimes")

    interface Simple extends Base, HasDateTime {}

    function ids_partition_and_prune_items_by_datetimes (args: PartitionItemsByDatetimeFuturesArgs<Simple>): PartitionItemsByDatetimeFuturesReturn<string>
    {
        const result = partition_and_prune_items_by_datetimes(args)
        return {
            invalid_items: result.invalid_items.map(({ id }) => id),
            past_items: result.past_items.map(({ id }) => id),
            present_items: result.present_items.map(({ id }) => id),
            future_items: result.future_items.map(({ id }) => id),
        }
    }

    let items: Simple[]
    let result: PartitionItemsByDatetimeFuturesReturn<string>

    const date1 = new Date("2021-04-01 00:01")
    const date1_ms = date1.getTime()
    const date2 = new Date("2021-04-01 00:02")
    const date2_ms = date2.getTime()
    const date3 = new Date("2021-04-01 00:03")
    const date3_ms = date3.getTime()

    const c1s1 = { id: "1", created_at: date1, datetime: { value: date1 } }
    const c1s2 = { id: "2", created_at: date1, datetime: { value: date2 } }
    const c2s1 = { id: "3", created_at: date2, datetime: { value: date1 } }
    const c2s2 = { id: "4", created_at: date2, datetime: { value: date2 } }
    const c2se = { id: "5", created_at: date2, datetime: {} }

    items = []
    result = ids_partition_and_prune_items_by_datetimes({ items, created_at_ms: date3_ms, sim_ms: date3_ms })
    test(result, {
        invalid_items: [],
        past_items: [],
        present_items: [],
        future_items: [],
    })

    items = [c1s1, c1s2, c2s1, c2s2, c2se]
    result = ids_partition_and_prune_items_by_datetimes({ items, created_at_ms: date3_ms, sim_ms: date3_ms })
    test(result, {
        invalid_items: [],
        past_items: [c1s1.id, c1s2.id, c2s1.id, c2s2.id],
        present_items: [c2se.id],
        future_items: [],
    })

    result = ids_partition_and_prune_items_by_datetimes({ items, created_at_ms: date3_ms, sim_ms: date1_ms })
    test(result, {
        invalid_items: [],
        past_items: [],
        present_items: [c1s1.id, c2s1.id, c2se.id],
        future_items: [c1s2.id, c2s2.id],
    })

    result = ids_partition_and_prune_items_by_datetimes({ items, created_at_ms: date1_ms, sim_ms: date3_ms })
    test(result, {
        invalid_items: [c2s1.id, c2s2.id, c2se.id],
        past_items: [c1s1.id, c1s2.id],
        present_items: [],
        future_items: [],
    })

    result = ids_partition_and_prune_items_by_datetimes({ items, created_at_ms: date1_ms, sim_ms: date1_ms })
    test(result, {
        invalid_items: [c2s1.id, c2s2.id, c2se.id],
        past_items: [],
        present_items: [c1s1.id],
        future_items: [c1s2.id],
    })
}



function run_tests ()
{
    test_get_tense_of_item()
    test_partition_items_by_datetimes()
    test_prune_present_by_temporal_and_logical_relations()
    test_partition_and_prune_items_by_datetimes()
}

// run_tests()
