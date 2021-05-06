import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { WComponent } from "../shared/models/interfaces/SpecialisedObjects"
import type { RootState } from "../state/State"
import { wcomponent_is_invalid_for_datetime } from "./utils"



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


    // const invalid = wcomponent_is_invalid_for_datetime(wcomponent, created_at_ms)


    return <p style={{ cursor: "not-allowed" }}>
        Last existence prediction
        {/* <PredictionViewSummary prediction={last_prediction} /> */}
    </p>
}

export const WComponentLatestPrediction = connector(_WComponentLatestPrediction) as FunctionalComponent<OwnProps>
