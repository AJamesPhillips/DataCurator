import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { ConnectionEndType } from "../canvas/connections/ConnectionEnd"
import { bezier_middle, derive_connection_coords } from "../canvas/connections/derive_coords"
import { Button } from "../sharedf/Button"
import { ACTIONS } from "../state/actions"
import { get_middle_of_screen } from "../state/display_options/display"
import { experimental_features } from "../state/display_options/persistance"
import {
    get_current_knowledge_view_from_state,
    get_wcomponent_from_state,
} from "../state/specialised_objects/accessors"
import { BulkUpdateChange } from "../state/specialised_objects/knowledge_views/bulk_edit/actions"
import type { RootState } from "../state/State"
import { get_store } from "../state/store"
import { wcomponent_is_plain_connection } from "../wcomponent/interfaces/SpecialisedObjects"
import { get_connection_termini } from "../wcomponent_canvas/connection/connection_termini"
import { ButtonSnapXToDatetime } from "./ButtonSnapXToDatetime"



type OwnProps = {
    wcomponent_id: string
    wcomponent_ids?: undefined
} | {
    wcomponent_id?: undefined
    wcomponent_ids: string[]
}


const map_state = (state: RootState, props: OwnProps) =>
{
    const kv = get_current_knowledge_view_from_state(state)
    const knowledge_view_id = kv?.id

    const wcomponent_ids = props.wcomponent_ids || [props.wcomponent_id]
    const wcomponent_node_present = !!wcomponent_ids.find(id => state.derived.wcomponent_ids_by_type.any_node.has(id))
    const wcomponent_link_present = !!wcomponent_ids.find(id => state.derived.wcomponent_ids_by_type.any_link.has(id))

    return {
        knowledge_view_id,
        kv,
        wcomponent_node_present,
        wcomponent_link_present,
    }
}


const map_dispatch = {
    snap_to_grid_knowledge_view_entries: ACTIONS.specialised_object.snap_to_grid_knowledge_view_entries,
    bulk_add_to_knowledge_view: ACTIONS.specialised_object.bulk_add_to_knowledge_view,
    bulk_update_knowledge_view_entries: ACTIONS.specialised_object.bulk_update_knowledge_view_entries,
    change_current_knowledge_view_entries_order: ACTIONS.specialised_object.change_current_knowledge_view_entries_order,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _AlignComponentForm (props: Props)
{
    const { wcomponent_id, knowledge_view_id, kv } = props
    const wcomponent_ids = props.wcomponent_ids || [props.wcomponent_id]


    const wcomponent_kv_wc_map_entry_index = (kv && wcomponent_id)
        ? Object.keys(kv.wc_id_map).findIndex(id => id === wcomponent_id)
        : undefined
    const total_kv_wc_map_entries = kv ? Object.keys(kv.wc_id_map).length : undefined


    const move_to_front_disabled = wcomponent_kv_wc_map_entry_index !== undefined && (wcomponent_kv_wc_map_entry_index + 1) === total_kv_wc_map_entries
    const move_to_back_disabled = wcomponent_kv_wc_map_entry_index === 0


    return <div>
        <h3>Align</h3>
        {props.wcomponent_node_present && <>
            <Button
                disabled={!knowledge_view_id}
                value="Snap to grid"
                onClick={() =>
                {
                    if (!knowledge_view_id) return
                    props.snap_to_grid_knowledge_view_entries({ wcomponent_ids, knowledge_view_id })
                }}
            />
            {experimental_features.get_state().enable_align_components_on_x_by_time && <>
                &nbsp;
                <ButtonSnapXToDatetime {...props} />
            </>}
            &nbsp;
            <Button
                disabled={!knowledge_view_id}
                value="Bring here"
                onClick={() =>
                {
                    if (!knowledge_view_id) return

                    const state = get_store().getState()
                    const override_entry = get_middle_of_screen(state)
                    props.bulk_add_to_knowledge_view({ knowledge_view_id, wcomponent_ids, override_entry })
                }}
            />
        </>}

        {props.wcomponent_node_present && props.wcomponent_link_present && <br/>}

        {props.wcomponent_link_present && <>
            <Button
                disabled={!knowledge_view_id}
                value="Manually update link location"
                onClick={() =>
                {
                    if (!knowledge_view_id) return

                    const state = get_store().getState()
                    const changes: BulkUpdateChange[] | undefined = calculate_middle_connection_curves(wcomponent_ids, state)
                    if (!changes) return

                    props.bulk_update_knowledge_view_entries({ knowledge_view_id, changes })
                }}
            />
        </>}

        <br />

        <span title={move_to_front_disabled ? "Already at front" : "Move to front"}>
            <Button
                value="Move to front"
                disabled={move_to_front_disabled}
                onClick={() =>
                {
                    props.change_current_knowledge_view_entries_order({ wcomponent_ids, order: "front" })
                }}
            />
        </span>
        &nbsp;
        <span title={move_to_back_disabled ? "Already at back" : "Move to back"}>
            <Button
                value="Move to back"
                disabled={move_to_back_disabled}
                onClick={() =>
                {
                    props.change_current_knowledge_view_entries_order({ wcomponent_ids, order: "back" })
                }}
            />
        </span>
    </div>
}

export const AlignComponentForm = connector(_AlignComponentForm) as FunctionalComponent<OwnProps>



function calculate_middle_connection_curves (wcomponent_ids: string[], state: RootState): BulkUpdateChange[] | undefined
{
    const composed_kv = state.derived.current_composed_knowledge_view
    if (!composed_kv) return

    return wcomponent_ids
        .map(id => get_wcomponent_from_state(state, id))
        .filter(wcomponent_is_plain_connection)
        .map(wcomponent => {
            const from_wc = get_wcomponent_from_state(state, wcomponent.from_id)
            const to_wc = get_wcomponent_from_state(state, wcomponent.to_id)

            const connection_termini = get_connection_termini({
                wcomponent, from_wc, to_wc, current_composed_knowledge_view: composed_kv,
            })

            const result = derive_connection_coords({
                ...connection_termini,
                end_size: 1,
                line_behaviour: wcomponent.line_behaviour,
                circular_links: true,
                connection_end_type: ConnectionEndType.positive,
            })

            if (!result) return undefined

            const mid_point = bezier_middle({
                point1: { x: result.line_start_x, y: result.line_start_y },
                relative_control_point1: result.relative_control_point1,
                relative_control_point2: result.relative_control_point2,
                point2: { x: result.line_end_x, y: result.line_end_y },
            })

            const bulk_update: BulkUpdateChange = {
                wcomponent_id: wcomponent.id,
                left: mid_point.x,
                top: -mid_point.y,
            }

            return bulk_update
        })
        .filter((change): change is BulkUpdateChange => !!change)
}
