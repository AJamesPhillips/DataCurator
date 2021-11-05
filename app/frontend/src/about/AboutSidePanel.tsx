import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"



interface OwnProps {}

const map_state = (state: RootState) =>
{
    const { ready_for_reading: ready } = state.sync

    return { ready }
}



const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _AboutSidePanel (props: Props)
{
    return <div>
        {!props.ready && <div>Loading...</div>}

        <span className="description_label">Version</span> <b>2021-11-05</b>
    </div>
}


export const AboutSidePanel = connector(_AboutSidePanel) as FunctionComponent<OwnProps>
