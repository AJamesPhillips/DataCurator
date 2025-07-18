import { FunctionComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AutocompleteText } from "../../form/Autocomplete/AutocompleteText"
import { ConfirmatoryDeleteButton } from "../../form/ConfirmatoryDeleteButton"
import { EditableCustomDateTime } from "../../form/EditableCustomDateTime"
import { EditablePosition } from "../../form/EditablePosition"
import { SelectKnowledgeView } from "../../knowledge_view/SelectKnowledgeView"
import { LabelsEditor } from "../../labels/LabelsEditor"
import type { KnowledgeViewWComponentIdEntryMap } from "../../shared/interfaces/knowledge_view"
import { is_defined } from "../../shared/utils/is_defined"
import { WarningTriangle } from "../../sharedf/WarningTriangle"
import { ACTIONS } from "../../state/actions"
import { get_middle_of_screen } from "../../state/display_options/display"
import {
    get_current_composed_knowledge_view_from_state,
    get_wcomponents_from_ids,
} from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { get_store } from "../../state/store"
import { prepare_new_contextless_wcomponent_object } from "../../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import { WComponent, wcomponent_is_causal_link } from "../../wcomponent/interfaces/SpecialisedObjects"
import { AlignComponentForm } from "../../wcomponent_form/AlignComponentForm"
import { wcomponent_type_options } from "../../wcomponent_form/type_options"
import { BasicCausalLinkForm } from "../../wcomponent_form/WComponentCausalLinkForm"



const map_state = (state: RootState) =>
{
    const kv = get_current_composed_knowledge_view_from_state(state)
    const { selected_wcomponent_ids_set } = state.meta_wcomponents
    const { wcomponents_by_id } = state.specialised_objects

    return {
        ready: state.sync.ready_for_reading,
        selected_wcomponent_ids_set,
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
    upsert_wcomponent: ACTIONS.specialised_object.upsert_wcomponent,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _WComponentMultipleForm (props: Props)
{
    if (!props.ready) return <div>Loading...</div>

    const {
        selected_wcomponent_ids_set,
        composed_wc_id_map,
        knowledge_view_id,
        wcomponents_by_id,
        editing,
        bulk_edit_knowledge_view_entries,
        bulk_add_to_knowledge_view,
        bulk_remove_from_knowledge_view,
        snap_to_grid_knowledge_view_entries,
        bulk_edit_wcomponents,
        upsert_wcomponent,
    } = props
    const selected_wcomponents = get_wcomponents_from_ids(wcomponents_by_id, selected_wcomponent_ids_set)
        .filter(is_defined)
    const selected_wcomponent_ids = Array.from(selected_wcomponent_ids_set)
    const all_wcomponent_ids_present_in_current_kv = calc_all_wcomponent_ids_present_in_current_kv(selected_wcomponent_ids, composed_wc_id_map)


    const label_ids_set = new Set<string>()
    const causal_link_wcomponent_ids: string[] = []
    // We want to capture simulation.js/InsightMaker Flow "effects" so
    // we need to move to string | undefined
    let effect_string: string | undefined = undefined

    selected_wcomponents.forEach(wc =>
    {
        (wc.label_ids || []).forEach(id => label_ids_set.add(id))

        if (wcomponent_is_causal_link(wc))
        {
            causal_link_wcomponent_ids.push(wc.id)
            effect_string = effect_string || wc.effect_string
        }
    })
    const label_ids: string[] = Array.from(label_ids_set).sort()


    if (selected_wcomponent_ids.length === 0)
    {
        return <div>
            <h2>No selected components</h2>
        </div>
    }


    return <div>
        <h2>{editing ? "Bulk editing" : "Viewing"} {selected_wcomponent_ids.length} components</h2>

        {editing && <p>
            <h3>Position</h3>
            <EditablePosition
                on_update={p => {
                    bulk_edit_knowledge_view_entries({
                        wcomponent_ids: selected_wcomponent_ids,
                        ...p,
                    })
                }}
            />
        </p>}

        {editing && <p>
            <AlignComponentForm wcomponent_ids={selected_wcomponent_ids} />
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

                    bulk_edit_wcomponents({
                        wcomponent_ids: selected_wcomponent_ids,
                        change: {}, remove_label_ids, add_label_ids,
                    })
                }}
            />
        </p>}

        {editing && causal_link_wcomponent_ids.length > 0 && <p>
            Causal Connection Values
            <BasicCausalLinkForm
                effect_string={effect_string}
                effect_when_true={undefined}
                effect_when_false={undefined}
                editing={editing}
                wcomponents_by_id={wcomponents_by_id}
                upsert_wcomponent={change => bulk_edit_wcomponents({
                    wcomponent_ids: causal_link_wcomponent_ids,
                    change,
                })}
            />
        </p>}


        {editing && <p>
            Component types
            <AutocompleteText
                placeholder="Type: "
                selected_option_id={undefined}
                allow_none={true}
                options={wcomponent_type_options}
                // Copied from WComponentForm
                on_change={type =>
                {
                    if (!type) return

                    selected_wcomponents.forEach(wcomponent =>
                    {
                        // This ensures it will always have the fields it is expected to have
                        const vanilla = prepare_new_contextless_wcomponent_object({
                            base_id: wcomponent.base_id,
                            type,
                        }) as WComponent

                        const new_wcomponent = { ...vanilla, ...wcomponent }
                        new_wcomponent.type = type

                        upsert_wcomponent({ wcomponent: new_wcomponent })
                    })
                }}
            />
        </p>}


        {editing && <p>
            <h3>Created at</h3>
            <EditableCustomDateTime
                value={undefined}
                on_change={custom_created_at => bulk_edit_wcomponents({
                    wcomponent_ids: selected_wcomponent_ids,
                    change: { custom_created_at },
                })}
            />
        </p>}

        {editing && <p>
            <h3>Add to knowledge view</h3>

            {all_wcomponent_ids_present_in_current_kv ? "" : <span>
                <WarningTriangle message="Not all components present in current view so will be added to center of view." />
                Not all components present in current view so will be added to center of view.
            </span>}

            <SelectKnowledgeView
                on_change={knowledge_view_id =>
                {
                    if (!knowledge_view_id) return

                    const state = get_store().getState()
                    const default_entry = get_middle_of_screen(state)

                    bulk_add_to_knowledge_view({
                        wcomponent_ids: selected_wcomponent_ids,
                        knowledge_view_id,
                        default_entry,
                    })
                }}
            />
        </p>}


        {editing && <p>
            <ConfirmatoryDeleteButton
                button_text="Delete from knowledge view"
                tooltip_text="Delete from knowledge view"
                on_delete={() =>
                {
                    bulk_remove_from_knowledge_view({
                        wcomponent_ids: selected_wcomponent_ids,
                        remove_type: "passthrough",
                    })
                }}
            />
        </p>}


        {editing && <p>
            <ConfirmatoryDeleteButton
                button_text="Delete and Block from knowledge view"
                tooltip_text="Delete and Block from showing in current knowledge view"
                on_delete={() =>
                {
                    bulk_remove_from_knowledge_view({
                        wcomponent_ids: selected_wcomponent_ids,
                        remove_type: "block",
                    })
                }}
            />
        </p>}

    </div>
}


export const WComponentMultipleForm = connector(_WComponentMultipleForm) as FunctionComponent



function calc_all_wcomponent_ids_present_in_current_kv (wcomponent_ids: string[], composed_wc_id_map: KnowledgeViewWComponentIdEntryMap | undefined)
{
    if (!composed_wc_id_map) return false

    return wcomponent_ids.find(id => !composed_wc_id_map[id]) === undefined
}
