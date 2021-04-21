// import { DateTime } from "luxon"

import type { TemporalUncertainty } from "../shared/models/interfaces/uncertainty"
import { date2str_auto } from "../shared/utils/date_helpers"
import { test } from "../shared/utils/test"



export function str_to_date (date_str: string)
{
    return new Date(date_str.trim())
}


export function valid_date_str (date_str: string)
{
    return valid_date(str_to_date(date_str))
}


export function date_to_string (date: Date | undefined, shorten_if_only_days: boolean = true)
{
    const as_string = (date && valid_date(date)) ? date2str_auto(date, shorten_if_only_days) : ""
    return as_string
}


export function uncertain_date_to_string (datetime: TemporalUncertainty)
{
    if (!datetime.min && !datetime.value && !datetime.max) return "External"

    const str = (
        date_to_string(datetime.min)
        + " < "
        + date_to_string(datetime.value)
        + " < "
        + date_to_string(datetime.max))

    return str
}


function valid_date (date: Date)
{
    return !Number.isNaN(date.getTime())
}



export function correct_datetime_for_local_time_zone (value: string): Date
{
    const a = new Date(value) // hoping this will parse as the current users timezone
    // const d = DateTime.fromJSDate(a)

    return a
}


function run_tests ()
{
    console. log("running tests of correct_datetime_for_local_time_zone")

    let result: Date

    result = correct_datetime_for_local_time_zone("2021-04-16 15:00")
    test(result.toISOString(), "2021-04-16T14:00:00.000Z")

    result = correct_datetime_for_local_time_zone("2021-04-16 00:00")
    test(result.toISOString(), "2021-04-15T23:00:00.000Z")

    result = correct_datetime_for_local_time_zone("2021-04-16")
    // This test **fails** because the date is parsed as UTC instead of the previous
    // datetimes being parsed as local timezone
    test(result.toISOString(), "2021-04-15T23:00:00.000Z")
}

// run_tests()
