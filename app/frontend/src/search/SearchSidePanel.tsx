import type { FunctionalComponent } from "preact"
import { h } from "preact"
import { useEffect } from "preact/hooks"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { Button } from "../sharedf/Button"
import { ACTIONS } from "../state/actions"
import { is_ctrl_f_search } from "../state/search/conditional_ctrl_f_search"
import type { RootState } from "../state/State"
import { WComponentSearchWindow } from "./WComponentSearchWindow"



const map_state = (state: RootState) =>
{
    return {
        ctrl_f_search: is_ctrl_f_search(state),
    }
}

const map_dispatch = {
    change_route: ACTIONS.routing.change_route,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _SearchSidePanel (props: Props)
{
    const [show_search, set_show_search] = useState(true)
    useEffect(() =>
    {
        if (props.ctrl_f_search) set_show_search(props.ctrl_f_search)
    }, [props.ctrl_f_search])

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
