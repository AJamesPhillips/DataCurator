import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { Button } from "../sharedf/Button"
import { ACTIONS } from "../state/actions"
import { get_middle_of_screen } from "../state/display_options/display"
import {
    get_current_knowledge_view_from_state,
} from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { get_store } from "../state/store"
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
    change_current_knowledge_view_entries_order: ACTIONS.specialised_object.change_current_knowledge_view_entries_order,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _AlignComponentForm (props: Props)
{
    const { wcomponent_id, wcomponent_ids, knowledge_view_id, kv } = props
    const ids: string[] = (wcomponent_id ? [wcomponent_id] : wcomponent_ids) || []


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
                    props.snap_to_grid_knowledge_view_entries({ wcomponent_ids: ids, knowledge_view_id })
                }}
                is_left={true}
            />
            &nbsp;
            <ButtonSnapXToDatetime {...props} />
            &nbsp;
            <Button
                disabled={!knowledge_view_id}
                value="Bring here"
                onClick={() =>
                {
                    if (!knowledge_view_id) return

                    const state = get_store().getState()
                    const override_entry = get_middle_of_screen(state)
                    props.bulk_add_to_knowledge_view({ knowledge_view_id, wcomponent_ids: ids, override_entry })
                }}
                is_left={true}
            />
        </>}

        {/* {props.wcomponent_node_present && props.wcomponent_link_present && <br/>}

        {props.wcomponent_link_present && <>
            {/ *
                todo: implement some controls to cause links to update their
                locations on the canvas so that other links can join to/from
                them.
            * /}
        </>} */}

        <br />

        <span title={move_to_front_disabled ? "Already at front" : "Move to front"}>
            <Button
                value="Move to front"
                disabled={move_to_front_disabled}
                onClick={() =>
                {
                    props.change_current_knowledge_view_entries_order({ wcomponent_ids: ids, order: "front" })
                }}
                is_left={true}
            />
        </span>
        &nbsp;
        <span title={move_to_back_disabled ? "Already at back" : "Move to back"}>
            <Button
                value="Move to back"
                disabled={move_to_back_disabled}
                onClick={() =>
                {
                    props.change_current_knowledge_view_entries_order({ wcomponent_ids: ids, order: "back" })
                }}
                is_left={true}
            />
        </span>
    </div>
}

export const AlignComponentForm = connector(_AlignComponentForm) as FunctionalComponent<OwnProps>
