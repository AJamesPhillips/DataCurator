import { FunctionalComponent, h } from "preact"

import { useEffect, useMemo, useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"
import { grid_small_step, round_coordinate_small_step } from "../../canvas/position_utils"
import type { KnowledgeViewWComponentEntry } from "../../shared/interfaces/knowledge_view"
import { color_to_string, darker_color } from "../../sharedf/color"
import type { RootState } from "../../state/State"
import { ACTIONS } from "../../state/actions"
import { pub_sub } from "../../state/pub_sub/pub_sub"
import { get_current_knowledge_view_from_state } from "../../state/specialised_objects/accessors"
import { default_frame_color } from "../../wcomponent_form/wcomponent_knowledge_view_form/default_frame_color"
import "./WComponentCanvasNodeBackgroundFrame.scss"



const OFFSET_TOP = grid_small_step
const OFFSET_RIGHT = grid_small_step


interface OwnProps
{
    wcomponent_id: string
    kv_entry: KnowledgeViewWComponentEntry | undefined
}


const map_state = (state: RootState) => ({
    is_editing: !state.display_options.consumption_formatting,
    frame_is_resizing: state.meta_wcomponents.frame_is_resizing,
    knowledge_view_id: get_current_knowledge_view_from_state(state)?.id,
})


const map_dispatch = {
    set_frame_is_resizing: ACTIONS.meta_wcomponents.set_frame_is_resizing,
    upsert_knowledge_view_entry: ACTIONS.specialised_object.upsert_knowledge_view_entry,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _WComponentCanvasNodeBackgroundFrame (props: Props)
{
    const {
        wcomponent_id, kv_entry, is_editing, frame_is_resizing, knowledge_view_id, set_frame_is_resizing
    } = props


    if (kv_entry?.frame_width === undefined || kv_entry?.frame_height === undefined) return null


    const [move_up_down, set_move_up_down] = useState<boolean | undefined>(undefined)
    const [temporary_drag_kv_entry, set_temporary_drag_kv_entry] = useState<KnowledgeViewWComponentEntry | undefined>(undefined)


    const on_pointer_down_factory = (up_down: boolean) => (e: h.JSX.TargetedEvent<HTMLDivElement, PointerEvent>) =>
    {
        e.stopImmediatePropagation()
        e.preventDefault()

        set_frame_is_resizing({ frame_is_resizing: true })
        set_move_up_down(up_down)
    }

    const on_pointer_down_bottom = useMemo(() => on_pointer_down_factory(true), [])
    const on_pointer_down_right = useMemo(() => on_pointer_down_factory(false), [])


    useEffect(() =>
    {
        return pub_sub.canvas.sub("canvas_move", position =>
        {
            if (move_up_down === undefined) return

            const frame_width = move_up_down ? kv_entry.frame_width : round_coordinate_small_step(position.x - kv_entry.left + OFFSET_RIGHT)
            const frame_height = move_up_down ? round_coordinate_small_step(-position.y - kv_entry.top + OFFSET_TOP) : kv_entry.frame_height

            set_temporary_drag_kv_entry({ ...kv_entry, frame_width, frame_height })
        })
    })


    useEffect(() =>
    {
        return pub_sub.canvas.sub("canvas_pointer_up", () =>
        {
            if (!frame_is_resizing || !knowledge_view_id) return
            if (!temporary_drag_kv_entry) return // type guard

            props.upsert_knowledge_view_entry({
                wcomponent_id,
                knowledge_view_id,
                entry: temporary_drag_kv_entry,
            })

            set_temporary_drag_kv_entry(undefined)
            set_frame_is_resizing({ frame_is_resizing: false })
            set_move_up_down(undefined)
        })
    })


    const _kv_entry = temporary_drag_kv_entry || kv_entry


    return <div
        className="wcomponent_background_frame"
        style={{
            top: _kv_entry.top - OFFSET_TOP,
            left: _kv_entry.left - OFFSET_RIGHT,
            width: _kv_entry.frame_width,
            height: _kv_entry.frame_height,
            backgroundColor: color_to_string(_kv_entry.frame_color || default_frame_color),
            borderColor: color_to_string(darker_color(_kv_entry.frame_color || default_frame_color)),
        }}
    >
        {is_editing && <div className="editable_edge editable_edge_bottom"
            onPointerDown={on_pointer_down_bottom}
        />}
        {is_editing && <div className="editable_edge editable_edge_right"
            onPointerDown={on_pointer_down_right}
        />}
    </div>
}

export const WComponentCanvasNodeBackgroundFrame = connector(_WComponentCanvasNodeBackgroundFrame) as FunctionalComponent<OwnProps>
