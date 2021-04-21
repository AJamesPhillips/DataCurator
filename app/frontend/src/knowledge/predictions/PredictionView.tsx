import { h } from "preact"

import { EditablePercentage } from "../../form/EditablePercentage"
import { EditableText } from "../../form/EditableText"
import type { Prediction } from "../../shared/models/interfaces/uncertainty"



interface OwnProps_Summary
{
    prediction: Prediction
    on_change?: (prediction: Prediction) => void
}


export function PredictionViewSummary (props: OwnProps_Summary)
{
    const { prediction, on_change } = props
    const { probability, conviction } = prediction

    return <div>
        Prob: <EditablePercentage
            placeholder="..."
            value={probability}
            on_change={on_change && (new_probability => on_change({ ...prediction, probability: new_probability }))}
        /> &nbsp; Conviction: <EditablePercentage
            placeholder="..."
            value={conviction}
            on_change={on_change && (new_conviction => on_change({ ...prediction, conviction: new_conviction }))}
        />
    </div>
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
        Explanation: <EditableText
            placeholder="Explanation..."
            value={explanation}
            on_change={update_prediction && (new_explanation => update_prediction({ explanation: new_explanation }))}
        />
    </div>
}
