import { FunctionComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"



interface OwnProps {}

const map_state = (state: RootState) =>
{
    return {}
}



const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _AboutSidePanel (props: Props)
{
    return <div>
        <span className="description_label">Version</span> <b>2025-05-13</b>
    </div>
}


export const AboutSidePanel = connector(_AboutSidePanel) as FunctionComponent<OwnProps>
