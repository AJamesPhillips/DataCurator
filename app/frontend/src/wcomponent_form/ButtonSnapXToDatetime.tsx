import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { round_coordinate_small_step } from "../canvas/position_utils"
import { time_scale_days_to_ms_pixels_fudge_factor } from "../shared/constants"
import { get_uncertain_datetime } from "../shared/uncertainty/datetime"

import { Button } from "../sharedf/Button"
import { ACTIONS } from "../state/actions"
import {
    get_current_composed_knowledge_view_from_state,
    get_current_knowledge_view_from_state,
    get_current_temporal_uncertainty_from_wcomponent,
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


    return <Button
        disabled={disabled}
        value="X by time"
        onClick={() =>
        {
            if (disabled) return

            // type guard as compiler erroring despite VSCode ok.  Different typescript versions?
            if (!kv || !wc_id_map || time_origin_ms === undefined || time_origin_x === undefined || time_scale === undefined) return

            const new_wc_id_map = {...wc_id_map}

            Array.from(has_single_datetime_wc_ids || [])
                .forEach(id =>
                {
                    const kv_entry = wc_id_map[id]
                    // type guard.  Later we might implment that it updates position in foundational knowledge view
                    if (!kv_entry) return

                    const store = get_store()
                    const state = store.getState()
                    const { wcomponents_by_id } = state.specialised_objects
                    const { created_at_ms } = state.routing.args

                    const temporal_uncertainty = get_current_temporal_uncertainty_from_wcomponent(id, wcomponents_by_id, created_at_ms)
                    if (!temporal_uncertainty) return

                    const datetime = get_uncertain_datetime(temporal_uncertainty)
                    if (!datetime) return


                    const left = calculate_canvas_x({
                        datetime,
                        time_origin_ms,
                        time_origin_x,
                        time_scale
                    })
                    const rounded_left = round_coordinate_small_step(left)
                    const new_kv_entry = { ...kv_entry, left: rounded_left }

                    new_wc_id_map[id] = new_kv_entry
                })

            upsert_knowledge_view({ knowledge_view: { ...kv, wc_id_map: new_wc_id_map } })
        }}
        is_left={true}
    />
}

export const ButtonSnapXToDatetime = connector(_ButtonSnapXToDatetime) as FunctionalComponent<OwnProps>



interface CalculateCanvasXArgs
{
    datetime: Date
    time_origin_ms: number
    time_origin_x: number
    time_scale: number
}
function calculate_canvas_x (args: CalculateCanvasXArgs)
{
    const time_diff = args.datetime.getTime() - args.time_origin_ms
    const time_scalar = args.time_scale / time_scale_days_to_ms_pixels_fudge_factor

    return (time_diff * time_scalar) + args.time_origin_x
}
