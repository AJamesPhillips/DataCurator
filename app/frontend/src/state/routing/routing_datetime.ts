import { date2str } from "../../shared/utils/date_helpers"
import type { RootState } from "../State"



export function routing_args_to_datetime_ms (state: RootState)
{
    const datetime = new Date(state.routing.args.cdate + " " + state.routing.args.ctime)

    if (Number.isNaN(datetime.getTime())) return 0

    return datetime.getTime()
}


export function created_at_datetime_to_routing_args (date: Date): { cdate: string, ctime: string }
{
    return {
        cdate: date2str(date, "yyyy-MM-dd"),
        ctime: date2str(date, "hh:mm:ss"),
    }
}

export function created_at_datetime_ms_to_routing_args (date_ms: number): { cdate: string, ctime: string }
{
    const date = new Date(date_ms)
    return created_at_datetime_to_routing_args(date)
}
