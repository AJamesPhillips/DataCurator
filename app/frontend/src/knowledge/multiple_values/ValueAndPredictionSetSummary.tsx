import { h } from "preact"

import "./ValueAndPredictionSetSummary.scss"
import type { StateValueAndPredictionsSet } from "../../shared/wcomponent/interfaces/state"



interface OwnProps
{
    VAP_set: StateValueAndPredictionsSet
}

export function ValueAndPredictionSetSummary (props: OwnProps)
{
    return <div className="value_and_prediction_set_summary">
        {props.VAP_set.entries.map(vap =>
        {
            return <div
                key={vap.id}
                className="value_and_prediction"
                style={{ height: `${vap.probability * 100}%`, maxHeight: `${vap.probability * 100}%` }}
            >
                {vap.value}
            </div>
        })}
    </div>
}
