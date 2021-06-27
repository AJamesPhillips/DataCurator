import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"



interface OwnProps {}

const map_state = (state: RootState) =>
{
    const ready = state.sync.ready

    return { ready }
}



const connector = connect(map_state)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _AboutSidePanel (props: Props)
{
    return <div>
        {!props.ready && <div>Loading...</div>}

        <span className="description_label">Version</span> <b>2021-06-27 10:10 UTC</b>
    </div>
}


export const AboutSidePanel = connector(_AboutSidePanel) as FunctionComponent<OwnProps>