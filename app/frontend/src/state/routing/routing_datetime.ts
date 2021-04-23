import { date2str } from "../../shared/utils/date_helpers"



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


// export function datetimes_to_routing_string_args (args: { created_at_datetime: Date, sim_datetime: Date })
// {
//     return {
//         cdate: date2str(args.created_at_datetime, "yyyy-MM-dd"),
//         ctime: date2str(args.created_at_datetime, "hh:mm:ss"),
//         sdate: date2str(args.sim_datetime, "yyyy-MM-dd"),
//         stime: date2str(args.sim_datetime, "hh:mm:ss"),
//     }
// }
