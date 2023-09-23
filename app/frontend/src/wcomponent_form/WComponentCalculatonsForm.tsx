import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { WComponentNodeStateV2 } from "../wcomponent/interfaces/state"
import type { RootState } from "../state/State"



interface OwnProps
{
    wcomponent: WComponentNodeStateV2
}


const map_state = (state: RootState) =>
{
    return {
    }
}


const map_dispatch = {
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentCalculatonsForm (props: Props)
{
    const {
    } = props

    return <div>
        WComponentCalculatonsForm
    </div>
}

export const WComponentCalculatonsForm = connector(_WComponentCalculatonsForm) as FunctionalComponent<OwnProps>
