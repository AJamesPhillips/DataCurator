// import { DateTime } from "luxon"

import type { TemporalUncertainty } from "../shared/uncertainty/uncertainty"
import { date2str_auto } from "../shared/utils/date_helpers"
import { test } from "../shared/utils/test"
import type { TimeResolution } from "../shared/utils/datetime"



export function str_to_date (date_str: string)
{
    return new Date(date_str.trim())
}


export function valid_date_str (date_str: string)
{
    return valid_date(str_to_date(date_str))
}


export function date_to_string (date: Date | undefined, time_resolution: TimeResolution)
{
    const as_string = (date && valid_date(date)) ? date2str_auto({ date, time_resolution }) : ""
    return as_string
}


export function uncertain_date_to_string (datetime: TemporalUncertainty, time_resolution: TimeResolution)
{
    let str = "Eternal"

    if (datetime.min || datetime.value || datetime.max)
    {
        const min = date_to_string(datetime.min, time_resolution)
        const value = date_to_string(datetime.value, time_resolution)
        const max = date_to_string(datetime.max, time_resolution)

        const strs: string[] = [
            min,
            min ? " " : "",
            "<",
            value ? " " : "",
            value,
            value ? " " : "",
            "<",
            max ? " " : "",
            max,
        ]
        str = strs.filter(s => s).join("")
    }

    return str
}


export function valid_date (date: Date)
{
    return !Number.isNaN(date.getTime())
}



export function correct_datetime_for_local_time_zone (value: string)
{
    const a = new Date(value) // hoping this will parse as the current users timezone
    // const d = DateTime.fromJSDate(a)

    return valid_date(a) ? a : undefined
}


function run_tests ()
{
    console. log("running tests of correct_datetime_for_local_time_zone")

    let result: Date | undefined

    result = correct_datetime_for_local_time_zone("2021-04-16 15:00")
    test(result && result.toISOString(), "2021-04-16T14:00:00.000Z")

    result = correct_datetime_for_local_time_zone("2021-04-16 00:00")
    test(result && result.toISOString(), "2021-04-15T23:00:00.000Z")

    result = correct_datetime_for_local_time_zone("2021-04-16")
    // This test **fails** because the date is parsed as UTC instead of the previous
    // datetimes being parsed as local timezone
    test(result && result.toISOString(), "2021-04-15T23:00:00.000Z")
}

// run_tests()
