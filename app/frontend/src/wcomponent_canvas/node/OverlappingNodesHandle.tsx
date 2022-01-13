import { FunctionalComponent, h } from "preact"
import { useMemo } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { AutoAwesomeMotionIcon } from "../../sharedf/icons/AutoAwesomeMotionIcon"
import { ACTIONS } from "../../state/actions"
import { get_overlapping_wcomponent_ids } from "../../state/derived/accessor"
import type { RootState } from "../../state/State"



interface OwnProps
{
    wcomponent_id: string
}



const map_state = (state: RootState, own_props: OwnProps) =>
({
    overlapping_wcomponent_ids: get_overlapping_wcomponent_ids(state, own_props.wcomponent_id),
})

const map_dispatch = {
    set_highlighted_wcomponent: ACTIONS.specialised_object.set_highlighted_wcomponent,
    change_route: ACTIONS.routing.change_route,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _OverlappingNodesHandle (props: Props)
{
    const { overlapping_wcomponent_ids, set_highlighted_wcomponent, change_route } = props
    const overlapping_node_number = overlapping_wcomponent_ids?.length || 0
    const hidden = overlapping_node_number === 0

    const class_name = "node_handle overlapping_nodes"
        + (hidden ? " hidden " : "")

    const title = overlapping_node_number ? `${overlapping_node_number - 1} other nodes at this location` : ""

    const select_next_node = useMemo(() =>
    {
        if (!overlapping_wcomponent_ids) return undefined

        return (e: h.JSX.TargetedMouseEvent<HTMLDivElement>) => {
            e.stopImmediatePropagation()
            set_highlighted_wcomponent({ id: props.wcomponent_id, highlighted: false })
            change_route({ item_id: overlapping_wcomponent_ids[0] })
        }
    }, [change_route, overlapping_wcomponent_ids])

    return <div className={class_name} title={title} onClick={select_next_node}>
        <AutoAwesomeMotionIcon fontSize="small" />
    </div>
}

export const OverlappingNodesHandle = connector(_OverlappingNodesHandle) as FunctionalComponent<OwnProps>
