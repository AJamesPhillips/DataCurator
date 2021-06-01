import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { WComponent } from "../shared/wcomponent/interfaces/SpecialisedObjects"
import type { RootState } from "../state/State"



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

    const invalid = false //wcomponent_is_invalid_for_datetime(wcomponent, created_at_ms, sim_ms)


    if (invalid)
    {
        return <p style={{ cursor: "not-allowed", display: "inline-flex", marginBlockEnd: 0 }}>
            Not valid (last validity prediction)
        </p>
    }

    return null
}

export const WComponentLatestPrediction = connector(_WComponentLatestPrediction) as FunctionalComponent<OwnProps>
