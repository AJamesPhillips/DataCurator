import { describe, test } from "../../../../lib/datacurator-core/src/utils/test"
import { supabase_get_items } from "./get_items"


interface SupabaseReadItem
{
    id: string
    base_id: number
    name: string
}

interface ConvertedReadItem
{
    id: number
    base_id: number
    name: string
}

function get_supabase_mock (): any
{
    return {
        from: () => ({
            select: () => ({
                order: () => ({
                    eq: () => ({
                        range: () => new Promise(resolve =>
                        {
                            const data: SupabaseReadItem[] = [
                                { id: "1", base_id: 1, name: "Item 1" },
                                { id: "2", base_id: 1, name: "Item 2" },
                            ]
                            resolve({
                                data,
                            })
                        })
                    })
                })
            })
        })
    }
}


export const test_supabase_get_items = describe.delay("supabase_get_items", () =>
{
    const converter = (item: SupabaseReadItem): ConvertedReadItem => ({...item, id: parseInt(item.id, 10)})

    describe("normal case", async () =>
    {
        const result = await supabase_get_items<SupabaseReadItem, ConvertedReadItem>({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            supabase: get_supabase_mock(),
            table: "test_table",
            converter,
            offset: 0,
            base_id: 1,
        })

        test(result.value.length, 2)
    })


    describe("return undefined for some values", async () =>
    {
        const result = await supabase_get_items<SupabaseReadItem, ConvertedReadItem | undefined>({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            supabase: get_supabase_mock(),
            table: "test_table",
            converter: item => item.id === "1" ? undefined : converter(item),
            offset: 0,
            base_id: 1,
        })

        test(result.value.length, 2)
        test(result.value[0], undefined)
        test(result.value[1]!.id, 2)
    })
})
