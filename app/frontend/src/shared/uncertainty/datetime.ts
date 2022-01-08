import type { TemporalUncertainty } from "./interfaces"



export function get_uncertain_datetime (datetime?: TemporalUncertainty)
{
    return datetime && (datetime.min || datetime.value || datetime.max)
}



export function uncertain_datetime_is_eternal (datetime: TemporalUncertainty)
{
    return get_uncertain_datetime(datetime) === undefined
}



export interface HasCalcdUncertainDatetime
{
    calcd_uncertain_datetime: Date
}
export function has_calcd_datetime <U> (p: U & Partial<HasCalcdUncertainDatetime>): p is U & HasCalcdUncertainDatetime
{
    return !!p.calcd_uncertain_datetime
}
