import { Box, FormControl, FormLabel } from "@mui/material"
import { FunctionComponent } from "preact"
import { useEffect, useRef, useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { AutocompleteText } from "../form/Autocomplete/AutocompleteText"
import { ConfirmatoryDeleteButton } from "../form/ConfirmatoryDeleteButton"
import { EditableTextOnBlurType } from "../form/editable_text/editable_text_common"
import { EditableText } from "../form/editable_text/EditableText"
import { EditableCheckbox } from "../form/EditableCheckbox"
import { EditableCustomDateTime } from "../form/EditableCustomDateTime"
import { LabelsEditor } from "../labels/LabelsEditor"
import { Button } from "../sharedf/Button"
import { ColorPicker } from "../sharedf/ColorPicker"
import { ExternalLinkIcon } from "../sharedf/icons/ExternalLinkIcon"
import { get_title, RichTextType } from "../sharedf/rich_text/get_rich_text"
import { WarningTriangle } from "../sharedf/WarningTriangle"
import { ACTIONS } from "../state/actions"
import { get_wc_id_to_counterfactuals_v2_map } from "../state/derived/accessor"
import { get_wcomponent_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { selector_chosen_base_id } from "../state/user_info/selector"
import { get_updated_wcomponent } from "../wcomponent/CRUD_helpers/get_updated_wcomponent"
import {
    prepare_new_contextless_wcomponent_object,
} from "../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import {
    WComponent,
    wcomponent_is_action,
    wcomponent_is_allowed_to_have_state_VAP_sets,
    wcomponent_is_causal_link,
    wcomponent_is_counterfactual_v2,
    wcomponent_is_deleted,
    wcomponent_is_event,
    wcomponent_is_not_deleted,
    wcomponent_is_plain_connection,
    wcomponent_is_state_value,
    wcomponent_is_statev2,
} from "../wcomponent/interfaces/SpecialisedObjects"
import {
    get_wcomponent_state_UI_value,
} from "../wcomponent_derived/get_wcomponent_state_UI_value"
import type { DerivedValueForUI } from "../wcomponent_derived/interfaces/value"
import { DisplayValue } from "../wcomponent_derived/shared_components/DisplayValue"
import { wcomponent_statev2_subtype_options, wcomponent_type_options } from "./type_options"
import { WComponentKnowledgeViewForm } from "./wcomponent_knowledge_view_form/WComponentKnowledgeViewForm"
import { WComponentCausalLinkForm } from "./WComponentCausalLinkForm"
import { WComponentConnectionForm } from "./WComponentConnectionForm"
import { WComponentCounterfactualForm } from "./WComponentCounterfactualForm"
import { WComponentEventAtFormField } from "./WComponentEventAtFormField"
import { WComponentFromTo } from "./WComponentFromTo"
import { WComponentImageForm } from "./WComponentImageForm"
import { WComponentParentActionForm } from "./WComponentParentActionForm"
import { WComponentStateForm } from "./WComponentStateForm"
import { WComponentStateValueForm } from "./WComponentStateValueForm"



interface OwnProps {
    wcomponent: WComponent
    wcomponent_from_different_base?: boolean // Quick hack to deal with loading wcomponents from other bases
}

const map_state = (state: RootState, { wcomponent }: OwnProps) =>
{
    let from_wcomponent: WComponent | undefined = undefined
    let to_wcomponent: WComponent | undefined = undefined
    if (wcomponent_is_plain_connection(wcomponent))
    {
        from_wcomponent = get_wcomponent_from_state(state, wcomponent.from_id)
        to_wcomponent = get_wcomponent_from_state(state, wcomponent.to_id)
    }


    const wc_id_to_counterfactuals_map = get_wc_id_to_counterfactuals_v2_map(state)

    const is_in_editing_mode = !state.display_options.consumption_formatting
    const base_for_wcomponent = (state.user_info.bases_by_id || {})[wcomponent.base_id]
    const allowed_to_edit = !!(base_for_wcomponent?.can_edit)

    return {
        ready: state.sync.ready_for_reading,
        base_id: selector_chosen_base_id(state),
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
        wc_id_to_counterfactuals_map,
        from_wcomponent,
        to_wcomponent,

        derived_composed_wcomponents_by_id: state.derived.composed_wcomponents_by_id,
        derived_composed_wcomponent: state.derived.composed_wcomponents_by_id[wcomponent.id],

        is_in_editing_mode,
        allowed_to_edit,
        editing_allowed: is_in_editing_mode && allowed_to_edit,
        base_for_wcomponent,

        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
    }
}


const map_dispatch = {
    upsert_wcomponent: ACTIONS.specialised_object.upsert_wcomponent,
    delete_wcomponent: ACTIONS.specialised_object.delete_wcomponent,
    update_chosen_base_id: ACTIONS.user_info.update_chosen_base_id,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentForm (props: Props)
{
    const { wcomponent, ready, base_id,
        wcomponents_by_id, knowledge_views_by_id, wc_id_to_counterfactuals_map, from_wcomponent, to_wcomponent,
        derived_composed_wcomponents_by_id, derived_composed_wcomponent,
        editing_allowed, created_at_ms, sim_ms } = props

    const wcomponent_id = wcomponent.id
    const [previous_id, set_previous_id] = useState<string>(wcomponent_id)


    if (!ready) return <div>Loading...</div>
    // Type guard
    if (!derived_composed_wcomponent) return <div>Loading...</div>
    if (base_id === undefined) return <div>Choose a project first.</div>


    const VAP_set_id_to_counterfactual_v2_map = wc_id_to_counterfactuals_map && wc_id_to_counterfactuals_map[wcomponent_id]?.VAP_sets


    const _focus_title = useRef(true)
    useEffect(() => set_previous_id(wcomponent_id), [wcomponent_id])
    if (previous_id !== wcomponent_id)
    {
        // Force the form to unmount all the components and trigger any conditional_on_blur handlers to fire.
        // The call to `set_previous_id` in the useEffect above will then trigger the form the render the
        // new component.
        //
        // TODO research if better way of clearing old forms.  We're using a controlled component but hooking
        // into the onBlur instead of onChange handler otherwise performance of the app is heavily degraded
        // because every tiny change to the wcomponent, e.g. typing the title, causes it to save back to the
        // server.
        // TODO: replace this `set_previous_id` hack with a throttled save?

        _focus_title.current = true

        return null
    }
    const focus_title = _focus_title.current
    _focus_title.current = false


    const wrapped_upsert_wcomponent = (partial_wcomponent: Partial<WComponent>) =>
    {
        const updated = get_updated_wcomponent(wcomponent, partial_wcomponent).wcomponent
        props.upsert_wcomponent({ wcomponent: updated })
    }


    let UI_value: DerivedValueForUI | undefined = undefined
    let has_VAP_sets = false
    if (wcomponent_is_allowed_to_have_state_VAP_sets(wcomponent))
    {
        UI_value = get_wcomponent_state_UI_value({ wcomponent: derived_composed_wcomponent, VAP_set_id_to_counterfactual_v2_map, created_at_ms, sim_ms })
        // TODO: document why this might be needed, i.e. how can we have a
        // component that is allowed to have VAP sets but then have it not have
        // any?
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        has_VAP_sets = (wcomponent.values_and_prediction_sets?.length || 0) > 0
    }


    const title = get_title({
        text_type: editing_allowed ? RichTextType.raw : RichTextType.rich,
        wcomponent: derived_composed_wcomponent,
        wcomponents_by_id: derived_composed_wcomponents_by_id,
        knowledge_views_by_id,
        wc_id_to_counterfactuals_map,
        created_at_ms,
        sim_ms,
    })
    const conditional_on_blur_title = (title: string) => wrapped_upsert_wcomponent({ title })


    return <Box>
        {props.is_in_editing_mode && !props.allowed_to_edit && <div>
            <WarningTriangle message="" />
            &nbsp;
            Not allow to edit.  Ask project owner to give you edit permissions.
        </div>}
        {props.wcomponent_from_different_base && <div
            style={{ cursor: "pointer" }}
            onClick={() => props.update_chosen_base_id({ base_id: wcomponent.base_id })}
            title={`Click to change to project ${wcomponent.base_id}`}
        >
            <WarningTriangle />
            &nbsp;
            Is part of project "{props.base_for_wcomponent?.title}"
        </div>}

        <FormControl
            variant="standard"
            fullWidth={true}
            margin="normal"
            style={{ fontWeight: 600, fontSize: 22 }}>
            <EditableText
                editing_allowed={editing_allowed}
                placeholder={wcomponent.type === "action" ? "Passive imperative title..." : (wcomponent.type === "relation_link" ? "Verb..." : "Title...")}
                value={title}
                on_blur={conditional_on_blur_title}
                on_blur_type={EditableTextOnBlurType.conditional}
                force_focus_on_first_render={focus_title}
                hide_label={true}
                spellcheck={true}
            />
        </FormControl>


        {UI_value && <span>
            <span className="description_label">Value </span>
            <DisplayValue UI_value={UI_value} />
        </span>}


        {
            // If it is a state component (i.e. it's type is "statev2") then when
            // not editing & no actual state values, then hide the "type" i.e.
            // simplify the entry to just pretend it's a typeless component because
            // the "statev2" is the default type and we expect most components will
            // have this type which whilst accurate, is not important to someone
            // coming to consume / read / understand what this component is about
            // and what the author is trying to communicate.
        }
        {(editing_allowed || wcomponent.type !== "statev2" || has_VAP_sets) && <FormControl variant="standard" component="fieldset" fullWidth={true} margin="normal">
            {// Keep up to date in WComponentMultipleForm
             // todo, document how and what is meant to be kept up to date in WComponentMultipleForm
            }
            <AutocompleteText
                editing_allowed={editing_allowed}
                placeholder="Type: "
                selected_option_id={wcomponent.type}
                options={wcomponent_type_options}
                on_change={type =>
                {
                    if (!type) return

                    // This ensures it will always have the fields it is expected to have
                    const vanilla = prepare_new_contextless_wcomponent_object({
                        type,
                        // Coherent & defensive even if its "not used", i.e. because of spread from
                        // wcomponent into new_component below
                        base_id: wcomponent.base_id,
                    })
                    const new_wcomponent = { ...vanilla, ...wcomponent }
                    new_wcomponent.type = type
                    wrapped_upsert_wcomponent(new_wcomponent)
                }}
            />
        </FormControl>}


        {wcomponent_is_statev2(wcomponent) && (editing_allowed || wcomponent.subtype) &&
        <div>
            <span className="description_label">Subtype</span>&nbsp;
            <div style={{ width: "60%", display: "inline-block" }}>
                <AutocompleteText
                    editing_allowed={editing_allowed}
                    placeholder="Subtype..."
                    selected_option_id={wcomponent.subtype}
                    options={wcomponent_statev2_subtype_options}
                    allow_none={true}
                    on_change={option_id => wrapped_upsert_wcomponent({ subtype: option_id })}
                />
            </div>
        </div>}


        {(editing_allowed || wcomponent.description) && <FormControl variant="standard" fullWidth={true} margin="normal">
            <EditableText
                editing_allowed={editing_allowed}
                placeholder="Description..."
                value={wcomponent.description}
                on_blur={description => wrapped_upsert_wcomponent({ description })}
                on_blur_type={EditableTextOnBlurType.conditional}
                hide_label={true}
            />
        </FormControl>}

        {
        // {wcomponent_is_statev2(wcomponent) && wcomponent.subtype === "boolean" && (editing || wcomponent.boolean_true_str) &&
        //<FormControl fullWidth={true} margin="normal">
        //    <EditableTextSingleLine
        //        placeholder="True..."
        //        value={wcomponent.boolean_true_str || ""}
        //        conditional_on_blur={boolean_true_str => upsert_wcomponent({ boolean_true_str })}
        //    />

        //</FormControl>}

        //{wcomponent_is_statev2(wcomponent) && wcomponent.subtype === "boolean" && (editing || wcomponent.boolean_false_str) &&
        //<FormControl fullWidth={true} margin="normal">
        //   <EditableTextSingleLine
        //        placeholder="False..."
        //        value={wcomponent.boolean_false_str || ""}
        //        conditional_on_blur={boolean_false_str => upsert_wcomponent({ boolean_false_str })}
        //    />
        //</FormControl>}
        }

        {wcomponent_is_state_value(wcomponent) && <WComponentStateValueForm
            wcomponent={wcomponent}
            upsert_wcomponent={wrapped_upsert_wcomponent}
        />}

        {wcomponent_is_counterfactual_v2(wcomponent) && <WComponentCounterfactualForm
            wcomponent={wcomponent}
            upsert_wcomponent={wrapped_upsert_wcomponent}
        />}


        {wcomponent_is_plain_connection(wcomponent) && <div>
            <div>
                <WComponentFromTo
                    connection_terminal_description="From"
                    wcomponent_id={from_wcomponent && from_wcomponent.id}
                    connection_terminal_type={wcomponent.from_type}
                    on_update_id={from_id => wrapped_upsert_wcomponent({ from_id })}
                    on_update_type={from_type => wrapped_upsert_wcomponent({ from_type })}
                    // Connections can not connect to themselves
                    exclude_ids={new Set([wcomponent.id])}
                />
            </div>

            <div>
                <WComponentFromTo
                    connection_terminal_description="To"
                    wcomponent_id={to_wcomponent && to_wcomponent.id}
                    connection_terminal_type={wcomponent.to_type}
                    on_update_id={to_id => wrapped_upsert_wcomponent({ to_id })}
                    on_update_type={to_type => wrapped_upsert_wcomponent({ to_type })}
                    // Connections can not connect to themselves
                    exclude_ids={new Set([wcomponent.id])}
                />
            </div>

            {editing_allowed && <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                <Button
                    value="Reverse Direction"
                    onClick={() =>
                    {
                        wrapped_upsert_wcomponent({ to_id: wcomponent.from_id, from_id: wcomponent.to_id })
                    }}
                />
            </div>}
        </div>}


        {wcomponent_is_causal_link(wcomponent) && <WComponentCausalLinkForm
            wcomponent={wcomponent}
            from_wcomponent={from_wcomponent}
            editing={editing_allowed}
            wcomponents_by_id={wcomponents_by_id}
            upsert_wcomponent={wrapped_upsert_wcomponent}
        />}


        {wcomponent_is_plain_connection(wcomponent) && <WComponentConnectionForm
            wcomponent={wcomponent}
            editing={editing_allowed}
            upsert_wcomponent={wrapped_upsert_wcomponent}
        />}


        {wcomponent_is_action(wcomponent) && <WComponentParentActionForm
            {...{ wcomponent, upsert_wcomponent: wrapped_upsert_wcomponent }}
        />}


        {(editing_allowed || (wcomponent.label_ids && wcomponent.label_ids.length > 0)) && <FormControl variant="standard" component="fieldset" fullWidth={true} margin="normal">
            <FormLabel component="legend">Labels</FormLabel>
            <LabelsEditor
                label_ids={wcomponent.label_ids}
                on_change={label_ids => wrapped_upsert_wcomponent({ label_ids })}
            />
        </FormControl>}

        {wcomponent_is_event(wcomponent)&& <WComponentEventAtFormField
            wcomponent={wcomponent}
            upsert_wcomponent={wrapped_upsert_wcomponent}
        />}


        {wcomponent_is_allowed_to_have_state_VAP_sets(wcomponent) && <WComponentStateForm
            editing_allowed={editing_allowed}
            wcomponent={wcomponent}
            upsert_wcomponent={wrapped_upsert_wcomponent}
        />}


        <br />
        <br />

        <FormControl variant="standard" fullWidth={true}>
            <EditableCustomDateTime
                editing_allowed={editing_allowed}
                title="Created at"
                invariant_value={wcomponent.created_at}
                value={wcomponent.custom_created_at}
                on_change={new_custom_created_at => {
                    wrapped_upsert_wcomponent({ custom_created_at: new_custom_created_at })
                }}
            /><br/>
        </FormControl>

        {editing_allowed && <div>
            <span className="description_label">Label color</span>
            <ColorPicker
                color={wcomponent.label_color}
                conditional_on_blur={color => wrapped_upsert_wcomponent({ label_color: color })}
            />
        </div>}

        {editing_allowed && <WComponentImageForm
            wcomponent={wcomponent}
            upsert_wcomponent={wrapped_upsert_wcomponent}
        />}
        {!editing_allowed && wcomponent.summary_image && <div>
            <a href={wcomponent.summary_image} target="_blank"><ExternalLinkIcon />Open image</a>
        </div>}

        {editing_allowed && <div>
            <span className="description_label">Hide node title</span>
            <EditableCheckbox
                value={wcomponent.hide_title}
                on_change={hide_title => wrapped_upsert_wcomponent({ hide_title })}
            />
            <span className="description_label">Hide node state</span>
            <EditableCheckbox
                value={wcomponent.hide_state}
                on_change={hide_state => wrapped_upsert_wcomponent({ hide_state })}
            />

            <hr />
        </div>}


        <WComponentKnowledgeViewForm
            wcomponent_id={wcomponent.id}
            editing_allowed={editing_allowed}
        />


        <br />
        <br />


        {editing_allowed && wcomponent_is_not_deleted(wcomponent) && <div>
            <ConfirmatoryDeleteButton
                button_text="Soft Delete (can undo)" // Todo: make recycle bin and empty after 30 days
                tooltip_text="Remove from all knowledge views"
                on_delete={() => props.delete_wcomponent({ wcomponent_id })}
            />
        </div>}

        {editing_allowed && wcomponent_is_deleted(wcomponent) && <div>
            <Button
                title="Undo delete"
                onClick={() => wrapped_upsert_wcomponent({ deleted_at: undefined })}
            >Restore</Button>
        </div>}


        <br />
    </Box>
}

export const WComponentForm = connector(_WComponentForm) as FunctionComponent<OwnProps>
