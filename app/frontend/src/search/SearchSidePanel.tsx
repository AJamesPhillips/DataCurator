import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../state/actions"
import { WComponentSearchWindow } from "./WComponentSearchWindow"



const map_dispatch = {
    change_route: ACTIONS.routing.change_route,
}

const connector = connect(null, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _SearchSidePanel (props: Props)
{
    return <WComponentSearchWindow
        on_change={wcomponent_id =>
        {
            if (!wcomponent_id) return
            props.change_route({ route: "wcomponents", item_id: wcomponent_id })
        }}
        on_blur={() =>
        {
            // Navigate away from the search route
            props.change_route({ route: "wcomponents" })
        }}
    />
}

export const SearchSidePanel = connector(_SearchSidePanel) as FunctionalComponent<{}>
