import { h } from "preact"

import { EditablePercentage } from "../../form/EditablePercentage"
import { EditableText } from "../../form/EditableText"
import type { Prediction } from "../../shared/wcomponent/interfaces/uncertainty"
import { UncertainDateTime } from "../uncertainty/datetime"
import { SummaryForPrediction } from "./common"



interface OwnProps_Summary
{
    prediction: Prediction
    on_change?: (prediction: Prediction) => void
}


export function PredictionViewSummary (props: OwnProps_Summary)
{
    const { prediction, on_change } = props
    const { datetime, probability, conviction } = prediction

    return <SummaryForPrediction
        datetime={datetime}
        probability={<EditablePercentage
            placeholder="..."
            value={probability}
            on_change={on_change && (new_probability => on_change({ ...prediction, probability: new_probability }))}
        />}
        conviction={<EditablePercentage
            placeholder="..."
            value={conviction}
            on_change={on_change && (new_conviction => on_change({ ...prediction, conviction: new_conviction }))}
        />}
    />
}




interface OwnProps_Details
{
    prediction: Prediction
    on_change?: (prediction: Prediction) => void
}


export function PredictionViewDetails (props: OwnProps_Details)
{
    const { on_change, prediction } = props
    const { explanation = "" } = prediction

    const update_prediction = !on_change ? undefined : (arg: Partial<Prediction>) =>
    {
        const new_prediction = { ...prediction, ...arg }
        on_change(new_prediction)
    }

    return <div>
        <br />
        <UncertainDateTime
            datetime={prediction.datetime}
            on_change={datetime => update_prediction && update_prediction({ datetime })}
        />
        <br />
        Explanation: <EditableText
            placeholder="Explanation..."
            value={explanation}
            on_change={update_prediction && (new_explanation => update_prediction({ explanation: new_explanation }))}
        />
    </div>
}
