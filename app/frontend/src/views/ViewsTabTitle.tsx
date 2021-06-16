import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"



const map_state = (state: RootState) => ({
    current_view: state.routing.args.view,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>


function _ViewsTabTitle (props: Props)
{
    const { current_view } = props
    const view = current_view.slice(0, 1).toUpperCase() + current_view.slice(1).replaceAll("_", " ")

    return <div>View ({view})</div>
}

export const ViewsTabTitle = connector(_ViewsTabTitle) as FunctionalComponent<{}>
