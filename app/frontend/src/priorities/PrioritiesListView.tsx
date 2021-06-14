import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { MainArea } from "../layout/MainArea"
import type { RootState } from "../state/State"



const map_state = (state: RootState) => {
    return {}
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>



function _PrioritiesListView (props: Props)
{
    return <MainArea
        main_content={<div>PrioritiesListView</div>}
    />
}

export const PrioritiesListView = connector(_PrioritiesListView) as FunctionalComponent<{}>
