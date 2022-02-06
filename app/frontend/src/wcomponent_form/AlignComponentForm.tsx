import { FunctionalComponent, h } from "preact"
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


const map_state = (state: RootState) =>
{
    const knowledge_view_id = get_current_knowledge_view_from_state(state)?.id

    return {
        knowledge_view_id,
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
    const { wcomponent_id, wcomponent_ids, knowledge_view_id } = props
    const ids: string[] = (wcomponent_id ? [wcomponent_id] : wcomponent_ids) || []

    return <div>
        <h3>Align</h3>
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
                const bulk_entry = get_middle_of_screen(state)
                props.bulk_add_to_knowledge_view({ knowledge_view_id, wcomponent_ids: ids, bulk_entry })
            }}
            is_left={true}
        />

        <br />

        <Button
            value="Move to front"
            onClick={() =>
            {
                props.change_current_knowledge_view_entries_order({ wcomponent_ids: ids, order: "front" })
            }}
            is_left={true}
        />
        &nbsp;
        <Button
            value="Move to back"
            onClick={() =>
            {
                props.change_current_knowledge_view_entries_order({ wcomponent_ids: ids, order: "back" })
            }}
            is_left={true}
        />
    </div>
}

export const AlignComponentForm = connector(_AlignComponentForm) as FunctionalComponent<OwnProps>
