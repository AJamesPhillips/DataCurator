import { FunctionalComponent, h } from "preact"

import "./PredictionSummary.css"
import { uncertain_date_to_string } from "../../form/datetime_utils"
import { EditableCustomDateTime } from "../../form/EditableCustomDateTime"
import type { TemporalUncertainty } from "../../shared/uncertainty/interfaces"
import { connect, ConnectedProps } from "react-redux"
import type { RootState } from "../../state/State"



interface OwnProps
{
    value?: string | undefined
    created_at?: Date
    datetime: TemporalUncertainty
    probability: string | h.JSX.Element
    conviction: string | h.JSX.Element
}



const map_state = (state: RootState) => ({
    time_resolution: state.display_options.time_resolution,
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _PredictionSummary (props: Props)
{
    const { value, created_at, datetime, probability, conviction, time_resolution } = props

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
                    {uncertain_date_to_string(datetime, time_resolution)}
                </div>
                {value && <div>&nbsp; &nbsp; &nbsp; {value}</div>}
            </div>

            <div className="summary_row">
                <div><span className="description_label">Confidence</span>&nbsp;{conviction}</div>
                <div>&nbsp; <span className="description_label">Prob</span>&nbsp;{probability}</div>
            </div>

        </div>
    </div>
}

export const PredictionSummary = connector(_PredictionSummary) as FunctionalComponent<OwnProps>
