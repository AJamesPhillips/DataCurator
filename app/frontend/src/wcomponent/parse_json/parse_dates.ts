import type { Base } from "../../shared/interfaces/base"
import type { HasUncertainDatetime, TemporalUncertainty } from "../../shared/uncertainty/interfaces"



export function parse_base_dates <T extends Base & Partial<HasUncertainDatetime>> (o: T): T
{
    return {
        ...o,
        created_at: new Date(o.created_at),
        custom_created_at: optional_date(o.custom_created_at),
        modified_at: optional_date(o.modified_at),
        datetime: optional_datetime_temporal_uncertainty(o.datetime)
    }
}



export const optional_date = (d: Date | undefined) => d === undefined ? undefined : new Date(d)



function optional_datetime_temporal_uncertainty (temporal_uncertainty?: TemporalUncertainty): TemporalUncertainty | undefined
{
    if (!temporal_uncertainty) return undefined

    return {
        ...temporal_uncertainty,
        value: optional_date(temporal_uncertainty.value),
        min: optional_date(temporal_uncertainty.min),
        max: optional_date(temporal_uncertainty.max),
    }
}
