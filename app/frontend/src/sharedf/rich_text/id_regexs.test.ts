import { describe, test } from "../../shared/utils/test"
import { uuid_v4_for_tests } from "../../utils/uuid_v4_for_tests"
import { get_double_at_mentioned_uuids_from_text, get_uuids_from_text, uuids_regex, uuids_regexes } from "./id_regexs"


export const test_id_regexs = describe.delay("id_regexs", () =>
{
    describe("uuids_regex", () =>
    {
        let result = "77777777-7777-4777-8777-777777777777".match(uuids_regex)
        test(result !== null, true, "should match a valid uuid")
        test(result?.[0], "77777777-7777-4777-8777-777777777777", "should match a valid uuid")
        result = "00000000-0000-0000-0000-00000000000".match(uuids_regex)
        test(result === null, true, "should fail to match a valid uuid with leading space")
        result = " 77777777-7777-4777-8777-777777777777".match(uuids_regex)
        test(result === null, true, "should fail to match a valid uuid with leading space")
    })

    describe("uuids_regexes", () =>
    {
        let result = `  77777777-7777-4777-8777-777777777777
        00000000-0000-0000-0000-00000000000
        11111111-1111-4111-8111-111111111111
        `.match(uuids_regexes)
        test(result !== null, true, "should match a string with valid uuids")
        test(result?.length, 2, "should match 2 valid uuids")
        test(result?.[0], "77777777-7777-4777-8777-777777777777", "should match first valid uuid")
        test(result?.[1], "11111111-1111-4111-8111-111111111111", "should match second valid uuid")
    })
})


export const test_get_ids_from_text = describe.delay("get_ids_from_text", () =>
{
    let ids: string[] = []

    describe("get_double_at_mentioned_uuids_from_text", () =>
    {
        ids = get_double_at_mentioned_uuids_from_text("")
        test(ids, [], "Should find no IDs in empty string")


        ids = get_double_at_mentioned_uuids_from_text("asd @@wc123 asd name@example.com #label dfg @@345 sf")
        test(ids, [], `Should not find old ids of "wc123", "345"`)


        const id1 = uuid_v4_for_tests(1)
        const id2 = uuid_v4_for_tests(2)
        ids = get_double_at_mentioned_uuids_from_text(`asd @@${id1} asd name@example.com #label dfg @@${id2} sf`)
        test(ids, [id1, id2], `Should find uuid ids`)
    })


    describe("get_uuids_from_text", () =>
    {
        ids = get_uuids_from_text("")
        test(ids, [], "Should find no IDs in empty string")

        const id1 = uuid_v4_for_tests(1)
        const id2 = uuid_v4_for_tests(2)
        ids = get_uuids_from_text(`1 + [${id1}] + (2 + [${id2}]) * 3`)
        test(ids, [id1, id2], `Should find uuid ids`)
    })

})
