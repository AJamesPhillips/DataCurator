import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { WComponent } from "../shared/models/interfaces/SpecialisedObjects"
import type { RootState } from "../state/State"
import { PredictionViewSummary } from "./predictions/PredictionView"
import { wcomponent_is_invalid_for_datetime, wcomponent_present_existence_for_datetimes } from "./utils"



interface OwnProps
{
    wcomponent: WComponent
}


const map_state = (state: RootState) => ({
    created_at_ms: state.routing.args.created_at_ms,
    sim_ms: state.routing.args.sim_ms,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentLatestPrediction (props: Props)
{
    const { wcomponent, created_at_ms, sim_ms } = props

    const invalid = wcomponent_is_invalid_for_datetime(wcomponent, created_at_ms, sim_ms)


    if (invalid)
    {
        return <p style={{ cursor: "not-allowed", display: "inline-flex", marginBlockEnd: 0 }}>
            Not valid (last validity prediction)
        </p>
    }


    const present_prediction = wcomponent_present_existence_for_datetimes(wcomponent, created_at_ms, sim_ms)

    if (!present_prediction) return null

    return <p style={{ cursor: "not-allowed" }}>
        <PredictionViewSummary prediction={present_prediction} />
    </p>
}

export const WComponentLatestPrediction = connector(_WComponentLatestPrediction) as FunctionalComponent<OwnProps>
