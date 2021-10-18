import type { TemporalUncertainty } from "./interfaces"



export function get_uncertain_datetime (datetime?: TemporalUncertainty)
{
    return datetime && (datetime.min || datetime.value || datetime.max)
}



export function uncertain_datetime_is_eternal (datetime: TemporalUncertainty)
{
    return get_uncertain_datetime(datetime) === undefined
}
