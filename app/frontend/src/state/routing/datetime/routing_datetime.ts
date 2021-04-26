import { date2str } from "../../../shared/utils/date_helpers"



export function routing_arg_datetime_strings_to_datetime (date: string | null, time: string | null): Date
{
    if (!date) return new Date()
    return date_and_time_strings_to_datetime(date, time || "")
}


function date_and_time_strings_to_datetime (date: string, time: string)
{
    const datetime = new Date(date + " " + time)

    if (Number.isNaN(datetime.getTime())) return new Date()

    return datetime
}



export function get_datetime_and_ms (args: { datetime: Date; ms?: undefined } | { ms: number; datetime?: undefined })
{
    if (args.ms === undefined) return { ms: args.datetime.getTime(), datetime: args.datetime }
    return { ms: args.ms, datetime: new Date(args.ms) }
}
