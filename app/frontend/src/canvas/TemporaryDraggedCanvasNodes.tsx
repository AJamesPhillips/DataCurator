import { FunctionalComponent, h } from "preact"
import { useEffect, useMemo, useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"
import { is_defined } from "../shared/utils/is_defined"

import { pub_sub } from "../state/pub_sub/pub_sub"
import { get_wcomponents_from_ids } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { throttle } from "../utils/throttle"
import type { WComponent } from "../wcomponent/interfaces/SpecialisedObjects"
import { WComponentCanvasNode } from "../wcomponent_canvas/node/WComponentCanvasNode"
import { ConnectableCanvasNode } from "./ConnectableCanvasNode"
import type { CanvasPoint } from "./interfaces"



export function TemporaryDraggedCanvasNodes ()
{
    const [wcomponent_ids, set_wcomponent_ids] = useState<string[]>([])
    const [relative_position, _set_relative_position] = useState<CanvasPoint | undefined>(undefined)
    const set_relative_position = useMemo(() =>
    {
        const set_relative_position = (new_rel_pos: CanvasPoint | undefined) => _set_relative_position(new_rel_pos)
        const throttle_set_relative_position = throttle(set_relative_position, 30)
        return throttle_set_relative_position
    }, [])

    useEffect(() =>
    {
        const unsubscribe_ids = pub_sub.canvas.sub("canvas_node_drag_wcomponent_ids", ids =>
        {
            set_wcomponent_ids(ids)
        })

        const unsubscribe_position = pub_sub.canvas.sub("canvas_node_drag_relative_position", new_relative_position =>
        {
            set_relative_position.throttled(new_relative_position)
            if (new_relative_position === undefined) set_relative_position.flush()
        })

        return () => { unsubscribe_ids(); unsubscribe_position(); }
    })


    if (!relative_position) return null

    return <div>
        {wcomponent_ids.map(wcomponent_id => <WComponentCanvasNode
            key={`temporary_dragged_canvas_node_${wcomponent_id}`}
            id={wcomponent_id}
            drag_relative_position={relative_position}
        />)}
    </div>
}
