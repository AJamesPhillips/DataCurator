import { h } from "preact"

import "./common.css"
import { uncertain_date_to_string } from "../../form/datetime_utils"
import { EditableCustomDateTime } from "../../form/EditableCustomDateTime"
import type { TemporalUncertainty } from "../../shared/wcomponent/interfaces/uncertainty"



interface OwnProps
{
    value?: string | undefined
    created_at?: Date
    datetime: TemporalUncertainty
    probability: string | h.JSX.Element
    conviction: string | h.JSX.Element
}


export function SummaryForPrediction (props: OwnProps)
{
    const { value, created_at, datetime, probability, conviction } = props

    return <div>
        {created_at && <div style={{ display: "inline-flex" }}>
            Created: &nbsp;<EditableCustomDateTime
                invariant_value={created_at}
                value={undefined}
            />
        </div>}
        <div className="summary_container" style={{ display: "inline-flex", width: "100%" }}>
            <div className="datetimes">
                {uncertain_date_to_string(datetime) || "-"}
            </div>
            {value && <div>Value:&nbsp;{value}</div>}
            <div>Prob:&nbsp;{probability}</div>
            <div>Cn:&nbsp;{conviction}</div>
        </div>
    </div>
}
