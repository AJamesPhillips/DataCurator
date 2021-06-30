import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { EditablePosition } from "../form/EditablePosition"
import { SelectKnowledgeView } from "../knowledge_view/SelectKnowledgeView"
import { Button } from "../sharedf/Button"
import {
    get_current_composed_knowledge_view_from_state,
    get_wcomponents_id_map,
} from "../state/specialised_objects/accessors"
import { LabelsEditor } from "../labels/LabelsEditor"
import { is_defined } from "../shared/utils/is_defined"
import { ConfirmatoryDeleteButton } from "../form/ConfirmatoryDeleteButton"



interface OwnProps {}

const map_state = (state: RootState) =>
{
    const kv = get_current_composed_knowledge_view_from_state(state)
    const wcomponent_ids = state.meta_wcomponents.selected_wcomponent_ids_set
    const { wcomponents_by_id } = state.specialised_objects

    return {
        ready: state.sync.ready,
        wcomponent_ids,
        wcomponents_by_id,
        knowledge_view_id: kv && kv.id,
        editing: !state.display_options.consumption_formatting,
    }
}


const map_dispatch = {
    bulk_edit_knowledge_view_entries: ACTIONS.specialised_object.bulk_edit_knowledge_view_entries,
    bulk_add_to_knowledge_view: ACTIONS.specialised_object.bulk_add_to_knowledge_view,
    bulk_remove_from_knowledge_view: ACTIONS.specialised_object.bulk_remove_from_knowledge_view,
    snap_to_grid_knowledge_view_entries: ACTIONS.specialised_object.snap_to_grid_knowledge_view_entries,
    bulk_edit_wcomponents: ACTIONS.specialised_object.bulk_edit_wcomponents,
}


const connector = connect(map_state, map_dispatch)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _WComponentMultipleForm (props: Props)
{
    if (!props.ready) return <div>Loading...</div>

    const {
        wcomponent_ids: ids,
        knowledge_view_id,
        wcomponents_by_id,
        editing,
        bulk_edit_knowledge_view_entries,
        bulk_add_to_knowledge_view,
        bulk_remove_from_knowledge_view,
        snap_to_grid_knowledge_view_entries,
        bulk_edit_wcomponents,
    } = props
    const wcomponent_ids = Array.from(ids)
    const wcomponents = get_wcomponents_id_map(wcomponents_by_id, wcomponent_ids).filter(is_defined)


    const label_ids_set = new Set<string>()
    wcomponents.forEach(wc => (wc.label_ids || []).forEach(id => label_ids_set.add(id)))
    const label_ids: string[] = Array.from(label_ids_set).sort()


    return <div>
        <h2>{editing ? "Bulk editing" : "Viewing"} {wcomponent_ids.length} components</h2>

        {editing && <p>
            Position:
            <EditablePosition
                point={{ left: 0, top: 0 }}
                on_update={p => {
                    bulk_edit_knowledge_view_entries({
                        wcomponent_ids,
                        change_left: p.left,
                        change_top: p.top,
                    })
                }}
            />
        </p>}

        {editing && <p>
            <Button
                disabled={!knowledge_view_id}
                value="Snap to grid"
                onClick={() =>
                {
                    if (!knowledge_view_id) return
                    snap_to_grid_knowledge_view_entries({ wcomponent_ids, knowledge_view_id })
                }}
                is_left={true}
            />
        </p>}

        {(editing || label_ids.length > 0) && <p>
            <LabelsEditor
                label_ids={label_ids}
                on_change={label_ids => bulk_edit_wcomponents({ wcomponent_ids, change: { label_ids } })}
            />
        </p>}

        <hr />

        {editing && <p>
            Add to knowledge view
            <SelectKnowledgeView
                on_change={knowledge_view_id =>
                {
                    if (!knowledge_view_id) return

                    bulk_add_to_knowledge_view({
                        wcomponent_ids: Array.from(wcomponent_ids),
                        knowledge_view_id,
                    })
                }}
            />
        </p>}

        {editing && <p>
            Remove from knowledge view
            <ConfirmatoryDeleteButton
                on_delete={() =>
                {
                    bulk_remove_from_knowledge_view({ wcomponent_ids: Array.from(wcomponent_ids) })
                }}
            />
        </p>}

    </div>
}


export const WComponentMultipleForm = connector(_WComponentMultipleForm) as FunctionComponent<OwnProps>
