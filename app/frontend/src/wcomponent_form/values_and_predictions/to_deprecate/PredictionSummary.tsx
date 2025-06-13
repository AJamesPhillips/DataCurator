import { h } from "preact"

import { uncertain_date_to_string } from "datacurator-core/utils/datetime"

import { EditableCustomDateTime } from "../../../form/EditableCustomDateTime"
import type { TemporalUncertainty } from "../../../shared/uncertainty/interfaces"
import "./PredictionSummary.scss"



interface OwnProps
{
    value?: string | h.JSX.Element | undefined
    created_at?: Date
    datetime: TemporalUncertainty
    probability: string | h.JSX.Element
    conviction: string | h.JSX.Element
}


export function PredictionSummary (props: OwnProps)
{
    const { value, created_at, datetime, probability, conviction } = props

    return <div>
        {created_at && <div style={{ display: "inline-flex" }}>
            Created: &nbsp;<EditableCustomDateTime
                invariant_value={created_at}
                value={undefined}
            />
        </div>}
        <div className="summary_container">
            <div className="summary_row">
                <div className="datetimes">
                    {uncertain_date_to_string(datetime)}
                </div>
                {value && <div>&nbsp; &nbsp; &nbsp; {value}</div>}
            </div>

            <div className="summary_row">
                <div><span className="description_label">Prob</span>&nbsp;{probability}</div>
                &nbsp; &nbsp;
                <div><span className="description_label">Confidence</span>&nbsp;{conviction}</div>
            </div>

        </div>
    </div>
}
