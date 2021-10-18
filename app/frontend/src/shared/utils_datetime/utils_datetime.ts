import { test } from "../utils/test"
import type { Base } from "../interfaces/base"
import type { HasUncertainDatetime } from "../uncertainty/interfaces"
import { get_uncertain_datetime } from "../uncertainty/datetime"



export function get_created_at_datetime (obj: { created_at: Date, custom_created_at?: Date }): Date
{
    return obj.custom_created_at || obj.created_at
}


export function get_created_at_ms (obj: { created_at: Date, custom_created_at?: Date }): number
{
    return get_created_at_datetime(obj).getTime()
}



export function get_sim_datetime (item: HasUncertainDatetime)
{
    return get_uncertain_datetime(item.datetime)
}

export function get_sim_datetime_ms (item: HasUncertainDatetime)
{
    const dt = get_sim_datetime(item)
    return dt === undefined ? undefined : dt.getTime()
}





interface PartitionItemsByCreatedAtDatetimeArgs<U>
{
    items: U[]
    created_at_ms: number
}
interface PartitionItemsByCreatedAtDatetimeReturn<U>
{
    invalid_future_items: U[]
    current_items: U[]
}
export function partition_items_by_created_at_datetime <U extends Base> (args: PartitionItemsByCreatedAtDatetimeArgs<U>): PartitionItemsByCreatedAtDatetimeReturn<U>
{
    const { items, created_at_ms } = args

    const invalid_future_items: U[] = []
    const current_items: U[] = []

    items.forEach(item =>
    {
        if (get_created_at_ms(item) > created_at_ms)
        {
            invalid_future_items.push(item)
        }
        else
        {
            current_items.push(item)
        }
    })


    return { invalid_future_items, current_items }
}




function test_partition_items_by_created_at_datetime ()
{
    console .log("running tests of partition_items_by_created_at_datetime")

    interface Simple extends Base {}

    function ids_partition_items_by_created_at_datetime (args: PartitionItemsByCreatedAtDatetimeArgs<Simple>): PartitionItemsByCreatedAtDatetimeReturn<string>
    {
        const result = partition_items_by_created_at_datetime(args)
        return {
            invalid_future_items: result.invalid_future_items.map(({ id }) => id),
            current_items: result.current_items.map(({ id }) => id),
        }
    }

    let items: Simple[]
    let result: PartitionItemsByCreatedAtDatetimeReturn<string>

    const date0 = new Date("2021-04-01 00:00")
    const date0_ms = date0.getTime()
    const date1 = new Date("2021-04-01 00:01")
    const date1_ms = date1.getTime()
    const date2 = new Date("2021-04-01 00:02")
    const date2_ms = date2.getTime()
    const date3 = new Date("2021-04-01 00:03")
    const date3_ms = date3.getTime()

    const c1: Simple = { base_id: -1, id: "1", created_at: date1 }
    const c2: Simple = { base_id: -1, id: "2", created_at: date2 }

    items = []
    result = ids_partition_items_by_created_at_datetime({ items, created_at_ms: date3_ms })
    test(result, {
        invalid_future_items: [],
        current_items: [],
    })

    items = [c1, c2]
    result = ids_partition_items_by_created_at_datetime({ items, created_at_ms: date3_ms })
    test(result, {
        invalid_future_items: [],
        current_items: [c1.id, c2.id],
    })

    result = ids_partition_items_by_created_at_datetime({ items, created_at_ms: date2_ms })
    test(result, {
        invalid_future_items: [],
        current_items: [c1.id, c2.id],
    })

    result = ids_partition_items_by_created_at_datetime({ items, created_at_ms: date1_ms })
    test(result, {
        invalid_future_items: [c2.id],
        current_items: [c1.id],
    })

    result = ids_partition_items_by_created_at_datetime({ items, created_at_ms: date0_ms })
    test(result, {
        invalid_future_items: [c1.id, c2.id],
        current_items: [],
    })
}



function run_tests ()
{
    test_partition_items_by_created_at_datetime()
}

// run_tests()
