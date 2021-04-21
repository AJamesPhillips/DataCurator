import { h } from "preact"

import {
    WComponent,
    wcomponent_has_existence_predictions,
    wcomponent_has_validity_predictions,
} from "../shared/models/interfaces/SpecialisedObjects"
import { PredictionViewSummary } from "./predictions/PredictionView"



interface OwnProps
{
    wcomponent: WComponent
}


export function WComponentLatestPrediction (props: OwnProps)
{
    const { wcomponent } = props


    if (wcomponent_has_validity_predictions(wcomponent))
    {
        const { validity } = wcomponent
        const last_prediction = validity[validity.length - 1]

        if (last_prediction && last_prediction.probability === 0)
        {
            return <p style={{ cursor: "not-allowed" }}>
                Not valid (<PredictionViewSummary prediction={last_prediction} />)
            </p>
        }
    }


    if (!wcomponent_has_existence_predictions(wcomponent)) return null

    const { existence } = wcomponent
    const last_prediction = existence[existence.length - 1]

    if (!last_prediction) return null

    return <p style={{ cursor: "not-allowed" }}>
        <PredictionViewSummary prediction={last_prediction} />
    </p>
}
