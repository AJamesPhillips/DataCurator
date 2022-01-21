import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { calculate_canvas_x_for_wcomponent_temporal_uncertainty } from "../knowledge_view/datetime_line"
import type { KnowledgeView, KnowledgeViewWComponentIdEntryMap } from "../shared/interfaces/knowledge_view"
import { Button } from "../sharedf/Button"
import { ACTIONS } from "../state/actions"
import {
    get_current_composed_knowledge_view_from_state,
    get_current_knowledge_view_from_state,
} from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import type { WComponentsById } from "../wcomponent/interfaces/SpecialisedObjects"



type OwnProps = {
    wcomponent_id: string
    wcomponent_ids?: undefined
} | {
    wcomponent_id?: undefined
    wcomponent_ids: string[]
}


const map_state = (state: RootState) =>
{
    const composed_kv = get_current_composed_knowledge_view_from_state(state)
    const kv = get_current_knowledge_view_from_state(state)
    const composed_datetime_line_config = composed_kv?.composed_datetime_line_config

    return {
        kv,
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        created_at_ms: state.routing.args.created_at_ms,
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
    const [number_changed, set_number_changed] = useState<number | undefined>(undefined)

    const {
        kv, wcomponent_id, wcomponents_by_id,
        created_at_ms, time_origin_ms, time_origin_x, time_scale,
        upsert_knowledge_view,
    } = props
    const wcomponent_ids: string[] = (wcomponent_id ? [wcomponent_id] : props.wcomponent_ids) || []

    const { id: knowledge_view_id, wc_id_map } = kv || {}
    const disabled = !kv
        || !knowledge_view_id
        || wc_id_map === undefined
        || time_origin_ms === undefined
        || time_origin_x === undefined
        || time_scale === undefined
        || (!!wcomponent_id && calculate_canvas_x_for_wcomponent_temporal_uncertainty({
            wcomponent_id, wcomponents_by_id, created_at_ms, time_origin_ms, time_origin_x, time_scale,
        }) === undefined)
    const title = !disabled ? "" :
        time_origin_ms === undefined ? "Disabled as time origin not set" :
        time_origin_x === undefined ? "Disabled as time origin X position is not set" : "Diabled"


    let number_changed_text = ""
    if (number_changed !== undefined)
    {
        if (!number_changed) number_changed_text = "No changes"
        else if (wcomponent_ids.length > 1) number_changed_text = `Changed ${number_changed}`
    }


    return <div style={{ display: "inline-block" }}>
        <Button
            disabled={disabled}
            value="X by time"
            title={title}
            onClick={() =>
            {
                if (disabled) return

                const { number_changed, knowledge_view } = calulate_new_positions({
                    wcomponent_ids, wcomponents_by_id, kv, wc_id_map,
                    created_at_ms,
                    time_origin_ms, time_origin_x, time_scale,
                })

                if (number_changed && knowledge_view) upsert_knowledge_view({ knowledge_view })
                set_number_changed(number_changed)
                setTimeout(() => set_number_changed(undefined), 1000)
            }}
            is_left={true}
        />
        {number_changed_text}
    </div>
}

export const ButtonSnapXToDatetime = connector(_ButtonSnapXToDatetime) as FunctionalComponent<OwnProps>



interface CalulateNewPositionsArgs
{
    wcomponent_ids: string[]
    wcomponents_by_id: WComponentsById
    kv: KnowledgeView | undefined
    wc_id_map: KnowledgeViewWComponentIdEntryMap | undefined
    created_at_ms: number
    time_origin_ms: number | undefined
    time_origin_x: number | undefined
    time_scale: number | undefined
}
function calulate_new_positions (args: CalulateNewPositionsArgs)
{
    const { wcomponent_ids, wcomponents_by_id, kv, wc_id_map, created_at_ms, time_origin_ms, time_origin_x, time_scale } = args

    let number_changed = 0

    // type guard as compiler erroring despite VSCode ok.  Different typescript versions?
    if (!kv || !wc_id_map || time_origin_ms === undefined || time_origin_x === undefined || time_scale === undefined)
    {
        return { number_changed, knowledge_view: undefined }
    }


    const new_wc_id_map = {...wc_id_map}

    wcomponent_ids.forEach(wcomponent_id =>
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
        number_changed += 1
    })


    const new_knowledge_view = number_changed ? { ...kv, wc_id_map: new_wc_id_map } : undefined

    return { number_changed, knowledge_view: new_knowledge_view }
}
