import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { calculate_canvas_x_for_wcomponent_temporal_uncertainty } from "../knowledge_view/datetime_line"

import { Button } from "../sharedf/Button"
import { ACTIONS } from "../state/actions"
import {
    get_current_composed_knowledge_view_from_state,
    get_current_knowledge_view_from_state,
} from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { get_store } from "../state/store"



interface OwnProps {}


const map_state = (state: RootState) =>
{
    const composed_kv = get_current_composed_knowledge_view_from_state(state)
    const kv = get_current_knowledge_view_from_state(state)
    const has_single_datetime_wc_ids = composed_kv?.wc_ids_by_type.has_single_datetime
    const composed_datetime_line_config = composed_kv?.composed_datetime_line_config

    return {
        kv,
        has_single_datetime_wc_ids,
        time_origin_ms: composed_datetime_line_config?.time_origin_ms,
        time_origin_x: composed_datetime_line_config?.time_origin_x,
        time_scale: composed_datetime_line_config?.time_scale,
    }
}


const map_dispatch = {
    upsert_knowledge_view: ACTIONS.specialised_object.upsert_knowledge_view
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _ButtonSnapXToDatetime (props: Props)
{
    const {
        kv,
        time_origin_ms, time_origin_x, time_scale,
        has_single_datetime_wc_ids,
        upsert_knowledge_view,
    } = props

    const { id: knowledge_view_id, wc_id_map } = kv || {}
    const disabled = !kv
        || !knowledge_view_id
        || wc_id_map === undefined
        || time_origin_ms === undefined
        || time_origin_x === undefined
        || time_scale === undefined
    const title = !disabled ? "" :
        time_origin_ms === undefined ? "Disabled as time origin not set" :
        time_origin_x === undefined ? "Disabled as time origin X position is not set" : "Diabled"


    return <Button
        disabled={disabled}
        value="X by time"
        title={title}
        onClick={() =>
        {
            if (disabled) return

            // type guard as compiler erroring despite VSCode ok.  Different typescript versions?
            if (!kv || !wc_id_map || time_origin_ms === undefined || time_origin_x === undefined || time_scale === undefined) return

            const new_wc_id_map = {...wc_id_map}
            const store = get_store()
            const state = store.getState()
            const { wcomponents_by_id } = state.specialised_objects
            const { created_at_ms } = state.routing.args

            Array.from(has_single_datetime_wc_ids || [])
                .forEach(wcomponent_id =>
                {
                    const kv_entry = wc_id_map[wcomponent_id]
                    // type guard.  Later we might implment that it updates position in foundational knowledge view.
                    // This current implmentation behaviour is inconsistent with the other bulk edits though so
                    // perhaps we should move to using the composed knowledge view's composed_wc_id_map
                    if (!kv_entry) return

                    const rounded_left = calculate_canvas_x_for_wcomponent_temporal_uncertainty({
                        wcomponent_id, wcomponents_by_id, created_at_ms, time_origin_ms, time_origin_x, time_scale,
                    })
                    if (rounded_left === undefined) return
                    const new_kv_entry = { ...kv_entry, left: rounded_left }

                    new_wc_id_map[wcomponent_id] = new_kv_entry
                })

            upsert_knowledge_view({ knowledge_view: { ...kv, wc_id_map: new_wc_id_map } })
        }}
        is_left={true}
    />
}

export const ButtonSnapXToDatetime = connector(_ButtonSnapXToDatetime) as FunctionalComponent<OwnProps>
