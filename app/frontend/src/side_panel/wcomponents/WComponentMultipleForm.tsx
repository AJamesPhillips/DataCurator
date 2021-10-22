import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../../state/actions"
import type { RootState } from "../../state/State"
import { EditablePosition } from "../../form/EditablePosition"
import { SelectKnowledgeView } from "../../knowledge_view/SelectKnowledgeView"
import { Button } from "../../sharedf/Button"
import {
    get_current_composed_knowledge_view_from_state,
    get_wcomponents_from_ids,
} from "../../state/specialised_objects/accessors"
import { LabelsEditor } from "../../labels/LabelsEditor"
import { is_defined } from "../../shared/utils/is_defined"
import { ConfirmatoryDeleteButton } from "../../form/ConfirmatoryDeleteButton"
import type { KnowledgeViewWComponentIdEntryMap } from "../../shared/interfaces/knowledge_view"
import { ButtonSnapXToDatetime } from "../../wcomponent_form/ButtonSnapXToDatetime"
import { EditableCustomDateTime } from "../../form/EditableCustomDateTime"
import { AlignComponentForm } from "../../wcomponent_form/AlignComponentForm"



interface OwnProps {}

const map_state = (state: RootState) =>
{
    const kv = get_current_composed_knowledge_view_from_state(state)
    const wcomponent_ids_set = state.meta_wcomponents.selected_wcomponent_ids_set
    const { wcomponents_by_id } = state.specialised_objects

    return {
        ready: state.sync.ready_for_reading,
        wcomponent_ids_set,
        wcomponents_by_id,
        knowledge_view_id: kv?.id,
        composed_wc_id_map: kv?.composed_wc_id_map,
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
type Props = ConnectedProps<typeof connector> & OwnProps



function _WComponentMultipleForm (props: Props)
{
    if (!props.ready) return <div>Loading...</div>

    const {
        wcomponent_ids_set,
        composed_wc_id_map,
        knowledge_view_id,
        wcomponents_by_id,
        editing,
        bulk_edit_knowledge_view_entries,
        bulk_add_to_knowledge_view,
        bulk_remove_from_knowledge_view,
        snap_to_grid_knowledge_view_entries,
        bulk_edit_wcomponents,
    } = props
    const wcomponents = get_wcomponents_from_ids(wcomponents_by_id, wcomponent_ids_set).filter(is_defined)
    const wcomponent_ids = Array.from(wcomponent_ids_set)
    const all_wcomponent_ids_present_in_current_kv = calc_all_wcomponent_ids_present_in_current_kv(wcomponent_ids, composed_wc_id_map)


    const label_ids_set = new Set<string>()
    wcomponents.forEach(wc => (wc.label_ids || []).forEach(id => label_ids_set.add(id)))
    const label_ids: string[] = Array.from(label_ids_set).sort()


    return <div>
        <h2>{editing ? "Bulk editing" : "Viewing"} {wcomponent_ids.length} components</h2>

        {editing && <p>
            <h3>Position</h3>
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
            <AlignComponentForm wcomponent_ids={wcomponent_ids} />
        </p>}

        {(editing || label_ids.length > 0) && <p>
            <h3>Label</h3>
            <LabelsEditor
                label_ids={label_ids}
                on_change={label_ids => bulk_edit_wcomponents({ wcomponent_ids, change: { label_ids } })}
            />
        </p>}

        {editing && <p>
            <h3>Created at</h3>
            <EditableCustomDateTime
                value={undefined}
                on_change={custom_created_at => bulk_edit_wcomponents({ wcomponent_ids, change: { custom_created_at } })}
            />
        </p>}

        {editing && <p>
            <h3>Add to knowledge view</h3>
            {all_wcomponent_ids_present_in_current_kv ?
            <SelectKnowledgeView
                exclude_ids={new Set(knowledge_view_id ? [knowledge_view_id]: [])}
                on_change={knowledge_view_id =>
                {
                    if (!knowledge_view_id) return

                    bulk_add_to_knowledge_view({
                        wcomponent_ids: Array.from(wcomponent_ids),
                        knowledge_view_id,
                    })
                }}
            />
            : " (Disabled - not all components present in current view)" }
        </p>}

        {editing && <p>
            <ConfirmatoryDeleteButton
                button_text="Remove from knowledge view (block)"
                tooltip_text="Remove from current knowledge view"
                on_delete={() =>
                {
                    bulk_remove_from_knowledge_view({
                        wcomponent_ids: Array.from(wcomponent_ids),
                        remove_type: "block",
                    })
                }}
            />
        </p>}

    </div>
}


export const WComponentMultipleForm = connector(_WComponentMultipleForm) as FunctionComponent<OwnProps>



function calc_all_wcomponent_ids_present_in_current_kv (wcomponent_ids: string[], composed_wc_id_map: KnowledgeViewWComponentIdEntryMap | undefined)
{
    if (!composed_wc_id_map) return false

    return wcomponent_ids.find(id => !composed_wc_id_map[id]) === undefined
}
