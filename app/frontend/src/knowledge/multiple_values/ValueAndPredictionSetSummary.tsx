import { h } from "preact"

import "./ValueAndPredictionSetSummary.scss"
import type { StateValueAndPredictionsSet } from "../../shared/wcomponent/interfaces/state"



interface OwnProps
{
    VAP_set: StateValueAndPredictionsSet
}

export function ValueAndPredictionSetSummary (props: OwnProps)
{
    const data = get_VAP_visuals_data(props.VAP_set)

    return <div className="value_and_prediction_set_summary">
        {data.map(vap_visual =>
        {
            return <div
                key={vap_visual.id}
                className="value_and_prediction"
                style={{ height: `${vap_visual.percentage_height}%`, maxHeight: `${vap_visual.percentage_height}%` }}
            >
                {vap_visual.option_text}
            </div>
        })}
    </div>
}



interface VAPVisual
{
    id: string
    option_text: string
    percentage_height: number
}
function get_VAP_visuals_data (VAP_set: StateValueAndPredictionsSet): VAPVisual[]
{
    const confidence = VAP_set.shared_entry_values?.conviction || 1
    const unconfidence = 1 - confidence

    const data: VAPVisual[] = VAP_set.entries.map(VAP => ({
        id: VAP.id,
        option_text: VAP.value,
        percentage_height: VAP.probability * confidence * 100,
    }))

    data.push({
        id: "",
        option_text: "?",
        percentage_height: unconfidence * 100,
    })

    return data
}
