import type { FunctionalComponent } from "preact"
import { h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { Button } from "../sharedf/Button"
import { ACTIONS } from "../state/actions"
import { WComponentSearchWindow } from "./WComponentSearchWindow"



const map_dispatch = {
    change_route: ACTIONS.routing.change_route,
}

const connector = connect(null, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _SearchSidePanel (props: Props)
{
    const [show_search, set_show_search] = useState(true)

    if (!show_search) return <div><Button value="Search" onClick={() => set_show_search(true)} /></div>

    return <WComponentSearchWindow
        on_change={wcomponent_id =>
        {
            if (!wcomponent_id) return
            props.change_route({ route: "wcomponents", item_id: wcomponent_id })
        }}
        on_blur={() => set_show_search(false)}
    />
}

export const SearchSidePanel = connector(_SearchSidePanel) as FunctionalComponent<{}>
