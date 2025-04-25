import { describe, test } from "../../shared/utils/test"
import { uuids_regex, uuids_regexes } from "./id_regexs"


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
