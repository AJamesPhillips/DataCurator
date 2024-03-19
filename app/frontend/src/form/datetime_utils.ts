// import { DateTime } from "luxon"

import type { TemporalUncertainty } from "../shared/uncertainty/interfaces"
import { date2str_auto } from "../shared/utils/date_helpers"
import type { TimeResolution } from "../shared/utils/datetime"
import { uncertain_datetime_is_eternal } from "../shared/uncertainty/datetime"



export function str_to_date (date_str: string)
{
    return new Date(date_str.trim())
}


export function valid_date_str (date_str: string)
{
    return valid_date(str_to_date(date_str))
}



interface DateToStringArgs
{
    date: Date | undefined
    time_resolution: TimeResolution
    trim_midnight?: boolean
}
export function date_to_string (args: DateToStringArgs)
{
    const { date, time_resolution, trim_midnight } = args
    const as_string = (date && valid_date(date)) ? date2str_auto({ date, time_resolution, trim_midnight }) : ""
    return as_string
}



export function uncertain_date_to_string (datetime: TemporalUncertainty, time_resolution: TimeResolution)
{
    let str = "Eternal"

    if (!uncertain_datetime_is_eternal(datetime))
    {
        const min = date_to_string({ date: datetime.min, time_resolution })
        const value = date_to_string({ date: datetime.value, time_resolution })
        const max = date_to_string({ date: datetime.max, time_resolution })

        if (value && !min && !max) return value

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
