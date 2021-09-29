import { h } from "preact"

import { EditablePercentage } from "../../form/EditablePercentage"
import { EditableText } from "../../form/editable_text/EditableText"
import type { Prediction } from "../../shared/uncertainty/uncertainty"
import { UncertainDateTime } from "../uncertainty/datetime"
import { PredictionSummary } from "./PredictionSummary"



interface OwnProps_Summary
{
    prediction: Prediction
    on_change?: (prediction: Prediction) => void
}


export function PredictionViewSummary (props: OwnProps_Summary)
{
    const { prediction, on_change } = props
    const { datetime, probability, conviction } = prediction

    return <PredictionSummary
        datetime={datetime}
        probability={<EditablePercentage
            placeholder="..."
            value={probability}
            conditional_on_change={on_change && (new_probability => on_change({ ...prediction, probability: new_probability }))}
        />}
        conviction={<EditablePercentage
            placeholder="..."
            value={conviction}
            conditional_on_change={on_change && (new_conviction => on_change({ ...prediction, conviction: new_conviction }))}
        />}
    />
}




interface OwnProps_Details
{
    prediction: Prediction
    editing: boolean
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
        {(props.editing || explanation) && <div>
            <span className="description_label">Explanation</span> <EditableText
                placeholder="Explanation..."
                value={explanation}
                conditional_on_blur={update_prediction && (new_explanation => update_prediction({ explanation: new_explanation }))}
            />
        </div>}
    </div>
}
