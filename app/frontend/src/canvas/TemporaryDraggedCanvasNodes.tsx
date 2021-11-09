import { FunctionalComponent, h } from "preact"
import { useEffect, useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"
import { ACTIONS } from "../state/actions"

import { pub_sub } from "../state/pub_sub/pub_sub"
import type { RootState } from "../state/State"
import { WComponentCanvasNode } from "../wcomponent_canvas/node/WComponentCanvasNode"
import type { CanvasPoint } from "./interfaces"



const map_state = (state: RootState) =>
({
    wcomponent_ids_to_move_list: state.meta_wcomponents.wcomponent_ids_to_move_list,
})


const map_dispatch = {
    bulk_edit_knowledge_view_entries: ACTIONS.specialised_object.bulk_edit_knowledge_view_entries,
    set_wcomponent_ids_to_move: ACTIONS.specialised_object.set_wcomponent_ids_to_move,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _TemporaryDraggedCanvasNodes (props: Props)
{
    const [relative_position, set_relative_position] = useState<CanvasPoint | undefined>(undefined)

    useEffect(() =>
    {
        function handle_canvas_node_drag_relative_position (new_relative_position: CanvasPoint | undefined)
        {
            if (relative_position && new_relative_position === undefined)
            {
                props.bulk_edit_knowledge_view_entries({
                    wcomponent_ids: props.wcomponent_ids_to_move_list,
                    change_left: relative_position.left,
                    change_top: relative_position.top,
                })
            }

            set_relative_position(new_relative_position)
        }


        const unsubscribe_position = pub_sub.canvas.sub("throttled_canvas_node_drag_relative_position", handle_canvas_node_drag_relative_position)

        return () => unsubscribe_position()
    })


    useEffect(() =>
    {
        if (relative_position !== undefined) return
        if (props.wcomponent_ids_to_move_list.length === 0) return

        // We call this here as a hack to get nodes to move to new position before becoming visible
        // so that they do not animate to the new position
        props.set_wcomponent_ids_to_move({ wcomponent_ids_to_move: new Set() })
    }, [relative_position])


    if (!relative_position) return null

    return <div>
        {props.wcomponent_ids_to_move_list.map(wcomponent_id => <WComponentCanvasNode
            key={`temporary_dragged_canvas_node_${wcomponent_id}`}
            id={wcomponent_id}
            drag_relative_position={relative_position}
        />)}
    </div>
}

export const TemporaryDraggedCanvasNodes = connector(_TemporaryDraggedCanvasNodes) as FunctionalComponent<{}>
