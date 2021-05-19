import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"
import { PrioritiesContentControls } from "../priorities/PrioritiesContentControls"



const map_state = (state: RootState) => {
    return {

    }
}

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>


function _MainContentControls (props: Props)
{
    return <div className="main_content_controls">
        <PrioritiesContentControls />
    </div>
}


export const MainContentControls = connector(_MainContentControls) as FunctionalComponent<{}>
