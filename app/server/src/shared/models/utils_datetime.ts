import { test } from "../utils/test"
import type { Base } from "./interfaces/base"
import type { HasDateTime } from "./interfaces/uncertainty"



export function get_created_at_ms (obj: { created_at: Date, custom_created_at?: Date }): number
{
    return (obj.custom_created_at || obj.created_at).getTime()
}



export function get_sim_datetime (item: HasDateTime)
{
    return (item.datetime.min || item.datetime.value || item.datetime.max)
}

export function get_sim_ms (item: HasDateTime): number | undefined
{
    const dt = get_sim_datetime(item)
    return dt === undefined ? undefined : dt.getTime()
}




interface PartitionItemsByDatetimeFuturesArgs<U>
{
    items: U[]
    created_at_ms: number
    sim_ms: number
}
interface PartitionItemsByDatetimeFuturesReturn<U>
{
    past_items: U[]
    future_items: U[]
}
export function partition_items_by_datetime_futures <U extends Base & HasDateTime> (args: PartitionItemsByDatetimeFuturesArgs<U>): PartitionItemsByDatetimeFuturesReturn<U>
{
    const { items, created_at_ms, sim_ms } = args

    const past_items: U[] = []
    const future_items: U[] = []

    items.forEach(item =>
    {
        const item_sim_ms = get_sim_ms(item)
        if (get_created_at_ms(item) <= created_at_ms && (item_sim_ms === undefined || item_sim_ms <= sim_ms))
        {
            past_items.push(item)
        }
        else
        {
            future_items.push(item)
        }
    })

    return { past_items, future_items }
}



function run_tests ()
{
    console .log("running tests of partition_items_by_datetime_futures")

    interface Simple extends Base, HasDateTime {}

    let items: Simple[]
    let result: PartitionItemsByDatetimeFuturesReturn<Simple>

    const date1 = new Date("2021-04-01 00:01")
    const date1_ms = date1.getTime()
    const date2 = new Date("2021-04-01 00:02")
    const date2_ms = date2.getTime()
    const date3 = new Date("2021-04-01 00:03")
    const date3_ms = date3.getTime()

    const d1d1 = { id: "1", created_at: date1, datetime: { value: date1 } }
    const d1d2 = { id: "2", created_at: date1, datetime: { value: date2 } }
    const d2d1 = { id: "3", created_at: date2, datetime: { value: date1 } }
    const d2d2 = { id: "4", created_at: date2, datetime: { value: date2 } }
    const d2de = { id: "4", created_at: date2, datetime: {} }

    items = []
    result = partition_items_by_datetime_futures({ items, created_at_ms: date3_ms, sim_ms: date3_ms })

    test(result, { past_items: [], future_items: [] })

    items = [d1d1, d1d2, d2d1, d2d2, d2de]
    result = partition_items_by_datetime_futures({ items, created_at_ms: date3_ms, sim_ms: date3_ms })
    test(result, { past_items: [d1d1, d1d2, d2d1, d2d2, d2de], future_items: [] })

    result = partition_items_by_datetime_futures({ items, created_at_ms: date3_ms, sim_ms: date1_ms })
    test(result, { past_items: [d1d1, d2d1, d2de], future_items: [d1d2, d2d2] })

    result = partition_items_by_datetime_futures({ items, created_at_ms: date1_ms, sim_ms: date3_ms })
    test(result, { past_items: [d1d1, d1d2], future_items: [d2d1, d2d2, d2de] })

    result = partition_items_by_datetime_futures({ items, created_at_ms: date1_ms, sim_ms: date1_ms })
    test(result, { past_items: [d1d1], future_items: [d1d2, d2d1, d2d2, d2de] })
}

// run_tests()
