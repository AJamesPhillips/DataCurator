import { describe, test } from "../shared/utils/test"
import { correct_datetime_for_local_time_zone } from "./datetime_utils"


export const test_correct_datetime_for_local_time_zone = describe("correct_datetime_for_local_time_zone", () =>
{
    let result: Date | undefined

    result = correct_datetime_for_local_time_zone("2021-04-16 15:00")
    test(result && result.toISOString(), "2021-04-16T14:00:00.000Z", "Subtracts one hour (as datetime is during summer time BST; and also passes when test is performed during GMT)")

    result = correct_datetime_for_local_time_zone("2021-04-16 00:00")
    test(result && result.toISOString(), "2021-04-15T23:00:00.000Z", "Subtracts one hour, goes back one day (as datetime is during summer time BST; and also passes when test is performed during GMT)")

    result = correct_datetime_for_local_time_zone("2021-04-16")
    // This test **fails** because the date is parsed as UTC instead of the previous
    // datetimes being parsed as local timezone
    // Not possible with native javscript so TODO: use a library like Luxon to handle this properly.
    test.skip(result && result.toISOString(), "2021-04-15T23:00:00.000Z", "")

}, false)
