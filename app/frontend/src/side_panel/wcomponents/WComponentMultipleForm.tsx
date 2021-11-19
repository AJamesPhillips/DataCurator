import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../../state/actions"
import type { RootState } from "../../state/State"
import { EditablePosition } from "../../form/EditablePosition"
import { SelectKnowledgeView } from "../../knowledge_view/SelectKnowledgeView"
import {
    get_current_composed_knowledge_view_from_state,
    get_wcomponents_from_ids,
} from "../../state/specialised_objects/accessors"
import { LabelsEditor } from "../../labels/LabelsEditor"
import { is_defined } from "../../shared/utils/is_defined"
import { ConfirmatoryDeleteButton } from "../../form/ConfirmatoryDeleteButton"
import type { KnowledgeViewWComponentIdEntryMap } from "../../shared/interfaces/knowledge_view"
import { EditableCustomDateTime } from "../../form/EditableCustomDateTime"
import { AlignComponentForm } from "../../wcomponent_form/AlignComponentForm"
import { wcomponent_is_causal_link } from "../../wcomponent/interfaces/SpecialisedObjects"
import { BasicCausalLinkForm } from "../../wcomponent_form/WComponentCausalLinkForm"



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
    const causal_link_wcomponent_ids: string[] = []
    let effect_when_true: number | undefined = undefined
    let effect_when_false: number | undefined = undefined
    wcomponents.forEach(wc =>
    {
        (wc.label_ids || []).forEach(id => label_ids_set.add(id))

        if (wcomponent_is_causal_link(wc))
        {
            causal_link_wcomponent_ids.push(wc.id)
            effect_when_true = wc.effect_when_true
            effect_when_false = wc.effect_when_false
        }
    })
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
            <h3>Labels</h3>
            <LabelsEditor
                label_ids={label_ids}
                on_change={new_label_ids =>
                {
                    const new_label_ids_set = new Set(new_label_ids)
                    const remove_label_ids = new Set(label_ids.filter(id => !new_label_ids_set.has(id)))
                    const add_label_ids = new Set(new_label_ids.filter(id => !label_ids_set.has(id)))

                    bulk_edit_wcomponents({ wcomponent_ids, change: {}, remove_label_ids, add_label_ids })
                }}
            />
        </p>}

        {editing && causal_link_wcomponent_ids.length > 0 && <p>
            Causal Connection Values
            <BasicCausalLinkForm
                show_primary_effect={true} // todo calculate these boolean flags appropriately
                show_effect_when_false={true}
                VAPs_represent_number={true}

                effect_when_true={effect_when_true}
                effect_when_false={effect_when_false}
                editing={editing}
                change_effect={arg => bulk_edit_wcomponents({ wcomponent_ids: causal_link_wcomponent_ids, change: arg })}
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
                button_text="Delete from knowledge view (allow passthrough from foundations)"
                tooltip_text="Delete from knowledge view (allow passthrough from foundations)"
                on_delete={() =>
                {
                    bulk_remove_from_knowledge_view({
                        wcomponent_ids: Array.from(wcomponent_ids),
                        remove_type: "passthrough",
                    })
                }}
            />
        </p>}


        {editing && <p>
            <ConfirmatoryDeleteButton
                button_text="Block from knowledge view"
                tooltip_text="Block from showing in current knowledge view"
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
