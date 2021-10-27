import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { useEffect, useMemo, useState } from "preact/hooks"
import { Box, FormControl, FormLabel } from "@material-ui/core"

import { AutocompleteText } from "../form/Autocomplete/AutocompleteText"
import { ConfirmatoryDeleteButton } from "../form/ConfirmatoryDeleteButton"
import { EditableCheckbox } from "../form/EditableCheckbox"
import { EditableCustomDateTime } from "../form/EditableCustomDateTime"
import { EditableText } from "../form/editable_text/EditableText"
import { EditableTextSingleLine } from "../form/editable_text/EditableTextSingleLine"
import { LabelsEditor } from "../labels/LabelsEditor"
import { prepare_new_contextless_wcomponent_object } from "../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import { get_updated_wcomponent } from "../wcomponent/CRUD_helpers/get_updated_wcomponent"
import { get_wcomponent_state_UI_value } from "../wcomponent_derived/get_wcomponent_state_UI_value"
import { VAPsType } from "../wcomponent/interfaces/VAPsType"
import {
    WComponent,
    wcomponent_is_plain_connection,
    wcomponent_can_have_validity_predictions,
    wcomponent_should_have_state_VAP_sets,
    wcomponent_is_statev2,
    wcomponent_is_counterfactual_v2,
    wcomponent_is_causal_link,
    wcomponent_is_judgement_or_objective,
    wcomponent_is_event,
    wcomponent_is_prioritisation,
    wcomponent_has_existence_predictions,
    wcomponent_is_goal,
    wcomponent_is_sub_state,
    wcomponent_has_objectives,
} from "../wcomponent/interfaces/SpecialisedObjects"
import { StateValueAndPredictionsSet, wcomponent_statev2_subtypes } from "../wcomponent/interfaces/state"
import { wcomponent_types } from "../wcomponent/interfaces/wcomponent_base"
import { get_title } from "../wcomponent_derived/rich_text/get_rich_text"
import { get_wcomponent_VAPs_represent } from "../wcomponent/get_wcomponent_VAPs_represent"
import { wcomponent_type_to_text } from "../wcomponent_derived/wcomponent_type_to_text"
import { ColorPicker } from "../sharedf/ColorPicker"
import { ACTIONS } from "../state/actions"
import { get_wc_id_to_counterfactuals_v2_map } from "../state/derived/accessor"
import { get_wcomponent_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { DisplayValue } from "../wcomponent_derived/shared_components/DisplayValue"
import { ValueAndPredictionSets } from "./values_and_predictions/ValueAndPredictionSets"
import { PredictionList } from "./values_and_predictions/to_deprecate/PredictionList"
import { WComponentFromTo } from "./WComponentFromTo"
import { WComponentLatestPrediction } from "./WComponentLatestPrediction"
import { ChosenObjectivesFormFields } from "./ChosenObjectivesFormFields"
import { JudgementFormFields } from "./JudgementFormFields"
import { WComponentCausalLinkForm } from "./WComponentCausalLinkForm"
import { WComponentCounterfactualForm } from "./WComponentCounterfactualForm"
import { WComponentDateTimeFormField } from "./WComponentDateTimeFormField"
import { WComponentEventAtFormField } from "./WComponentEventAtFormField"
import { WComponentKnowledgeViewForm } from "./WComponentKnowledgeViewForm"
import { WComponentImageForm } from "./WComponentImageForm"
import { Button } from "../sharedf/Button"
import { selector_chosen_base_id } from "../state/user_info/selector"
import { ValuePossibilitiesComponent } from "./value_possibilities/ValuePossibilitiesComponent"
import type { ValuePossibilitiesById } from "../wcomponent/interfaces/possibility"
import { update_VAPSets_with_possibilities } from "../wcomponent/CRUD_helpers/update_VAPSets_with_possibilities"
import { WComponentSubStateForm } from "./WComponentSubStateForm"
import type { DerivedValueForUI } from "../wcomponent_derived/interfaces/value"
import { WComponentConnectionForm } from "./WComponentConnectionForm"
import { get_default_wcomponent_title } from "../wcomponent_derived/rich_text/get_default_wcomponent_title"



interface OwnProps {
    wcomponent: WComponent
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


    return {
        ready: state.sync.ready_for_reading,
        base_id: selector_chosen_base_id(state),
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        wc_id_to_counterfactuals_map,
        from_wcomponent,
        to_wcomponent,
        editing: !state.display_options.consumption_formatting,
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
    }
}


const map_dispatch = {
    upsert_wcomponent: ACTIONS.specialised_object.upsert_wcomponent,
    delete_wcomponent: ACTIONS.specialised_object.delete_wcomponent,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentForm (props: Props)
{
    const [previous_id, set_previous_id] = useState<undefined | string>(undefined)
    const [focus_title, set_focus_title] = useState(true)

    const wcomponent_id = props.wcomponent.id

    useEffect(() =>
    {
        set_previous_id(wcomponent_id)
        set_focus_title(true)
    }, [wcomponent_id])


    const { wcomponent, wcomponents_by_id, wc_id_to_counterfactuals_map, from_wcomponent, to_wcomponent,
        editing, created_at_ms, sim_ms } = props

    const default_title = useMemo(() =>
    {
        return get_default_wcomponent_title({
            wcomponent, rich_text: false, wcomponents_by_id, wc_id_to_counterfactuals_map, created_at_ms, sim_ms
        })
    }, [wcomponent_id])


    const { ready, base_id } = props
    if (!ready) return <div>Loading...</div>
    if (base_id === undefined) return <div>Choose a base first.</div>


    const VAP_set_id_to_counterfactual_v2_map = wc_id_to_counterfactuals_map && wc_id_to_counterfactuals_map[wcomponent_id]?.VAP_sets


    if (previous_id !== wcomponent_id && previous_id !== undefined)
    {
        // Force the form to unmount all the components and trigger any conditional_on_blur handlers to fire.
        // TODO research if better way of clearing old forms.  We're using a controlled component but hooking
        // into the onBlur instead of onChange handler otherwise performance of the app is heavily degraded
        return null
    }

    if (focus_title) set_focus_title(false) // we only want to focus the title once per new wcomponent form rendering


    const upsert_wcomponent = (partial_wcomponent: Partial<WComponent>) =>
    {
        const updated = get_updated_wcomponent(wcomponent, partial_wcomponent).wcomponent
        props.upsert_wcomponent({ wcomponent: updated })
    }


    const orig_validity_predictions = wcomponent_can_have_validity_predictions(wcomponent) ? (wcomponent.validity || []) : undefined


    const VAPs_represent = get_wcomponent_VAPs_represent(wcomponent)
    let UI_value: DerivedValueForUI | undefined = undefined
    let orig_values_and_prediction_sets: StateValueAndPredictionsSet[] | undefined = undefined
    let orig_value_possibilities: ValuePossibilitiesById | undefined = undefined
    if (wcomponent_should_have_state_VAP_sets(wcomponent))
    {
        UI_value = get_wcomponent_state_UI_value({ wcomponent, VAP_set_id_to_counterfactual_v2_map, created_at_ms, sim_ms })
        orig_values_and_prediction_sets = wcomponent.values_and_prediction_sets || []
        orig_value_possibilities = wcomponent.value_possibilities
    }


    return <Box className={`editable-${wcomponent_id}`}>
        <FormControl fullWidth={true} margin="normal" style={{ fontWeight: 600, fontSize: 22 }}>
            <EditableText
                placeholder={wcomponent.type === "action" ? "Passive imperative title..." : (wcomponent.type === "relation_link" ? "Verb..." : "Title...")}
                value={get_title({ rich_text: !editing, wcomponent, wcomponents_by_id, wc_id_to_counterfactuals_map, created_at_ms, sim_ms }) || default_title}
                conditional_on_blur={title => upsert_wcomponent({ title })}
                force_focus={focus_title}
                hide_label={true}
            />
        </FormControl>


        <WComponentLatestPrediction wcomponent={wcomponent} />


        {UI_value && (editing || UI_value.is_defined) &&
        <a // Temporarily provide link to open issue
            style={{ color: "#bbb", textDecoration: "none" }}
            title="This is broken for counterfactuals at the moment.  See issue 81"
            href="https://github.com/centerofci/data-curator2/issues/81"
            target="_blank"
        >
            <span className="description_label">Value</span>
            <DisplayValue UI_value={UI_value} />
        </a>}

        <FormControl component="fieldset" fullWidth={true} margin="normal">
            <AutocompleteText
                placeholder="Type: "
                selected_option_id={wcomponent.type}
                options={wcomponent_type_options}
                on_change={type =>
                {
                    if (!type) return

                    // This ensures it will always have the fields it is expected to have
                    const vanilla = prepare_new_contextless_wcomponent_object({ base_id, type }) as WComponent
                    const new_wcomponent = { ...vanilla, ...wcomponent }
                    new_wcomponent.type = type
                    upsert_wcomponent(new_wcomponent)
                }}
            />
        </FormControl>

        {wcomponent_is_statev2(wcomponent) && (editing || (orig_values_and_prediction_sets?.length || 0) > 0) &&
        <p>
            <span className="description_label">Sub type</span>&nbsp;
            <div style={{ width: "60%", display: "inline-block" }}>
                <AutocompleteText
                    placeholder="Sub type..."
                    selected_option_id={wcomponent.subtype}
                    options={wcomponent_statev2_subtype_options}
                    on_change={option_id => upsert_wcomponent({ subtype: option_id })}
                />
            </div>
        </p>}


        {(editing || wcomponent.description) && <FormControl fullWidth={true} margin="normal">
            <EditableText
                placeholder="Description..."
                value={wcomponent.description}
                conditional_on_blur={description => upsert_wcomponent({ description })}
                hide_label={true}
            />
        </FormControl>}

        {/* {wcomponent_is_statev2(wcomponent) && wcomponent.subtype === "boolean" && (editing || wcomponent.boolean_true_str) &&
        <FormControl fullWidth={true} margin="normal">
            <EditableTextSingleLine
                placeholder="True..."
                value={wcomponent.boolean_true_str || ""}
                conditional_on_blur={boolean_true_str => upsert_wcomponent({ boolean_true_str })}
            />

        </FormControl>}

        {wcomponent_is_statev2(wcomponent) && wcomponent.subtype === "boolean" && (editing || wcomponent.boolean_false_str) &&
        <FormControl fullWidth={true} margin="normal">
           <EditableTextSingleLine
                placeholder="False..."
                value={wcomponent.boolean_false_str || ""}
                conditional_on_blur={boolean_false_str => upsert_wcomponent({ boolean_false_str })}
            />
        </FormControl>} */}

        {wcomponent_is_sub_state(wcomponent) && <WComponentSubStateForm
            wcomponent={wcomponent}
            upsert_wcomponent={upsert_wcomponent}
        />}

        {wcomponent_is_counterfactual_v2(wcomponent) && <WComponentCounterfactualForm
            wcomponent={wcomponent}
            upsert_wcomponent={upsert_wcomponent}
        />}


        {wcomponent_is_plain_connection(wcomponent) && <p>
            <WComponentFromTo
                connection_terminal_description="From"
                wcomponent_id={from_wcomponent && from_wcomponent.id}
                connection_terminal_type={wcomponent.from_type}
                on_update_id={from_id => upsert_wcomponent({ from_id })}
                on_update_type={from_type => upsert_wcomponent({ from_type })}
            />
        </p>}

        {wcomponent_is_plain_connection(wcomponent) && <p>
            <WComponentFromTo
                connection_terminal_description="To"
                wcomponent_id={to_wcomponent && to_wcomponent.id}
                connection_terminal_type={wcomponent.to_type}
                on_update_id={to_id => upsert_wcomponent({ to_id })}
                on_update_type={to_type => upsert_wcomponent({ to_type })}
            />
        </p>}


        {wcomponent_is_causal_link(wcomponent) && <WComponentCausalLinkForm
            wcomponent={wcomponent}
            from_wcomponent={from_wcomponent}
            editing={editing}
            upsert_wcomponent={upsert_wcomponent}
        />}


        {wcomponent_is_plain_connection(wcomponent) && <WComponentConnectionForm
            wcomponent={wcomponent}
            editing={editing}
            upsert_wcomponent={upsert_wcomponent}
        />}


        {wcomponent_is_judgement_or_objective(wcomponent) && <JudgementFormFields { ...{ wcomponent, upsert_wcomponent }} /> }


        {(editing || (wcomponent.label_ids && wcomponent.label_ids.length > 0)) && <FormControl component="fieldset" fullWidth={true} margin="normal">
            <FormLabel component="legend">Labels</FormLabel>
            <LabelsEditor
                label_ids={wcomponent.label_ids}
                on_change={label_ids => upsert_wcomponent({ label_ids })}
            />
        </FormControl>}

        {wcomponent_is_event(wcomponent)&& <WComponentEventAtFormField
            wcomponent={wcomponent}
            upsert_wcomponent={upsert_wcomponent}
        />}

        {wcomponent_is_prioritisation(wcomponent) && <WComponentDateTimeFormField
            wcomponent={wcomponent}
            upsert_wcomponent={upsert_wcomponent}
        />}


        {orig_validity_predictions && (editing || orig_validity_predictions.length > 0) && <div>
            <br />

            <p>
                <PredictionList
                    // TODO remove this hack and restore existence predictions
                    item_descriptor={(wcomponent_is_plain_connection(wcomponent) ? "Existence " : "Validity ") + " prediction"}
                    predictions={orig_validity_predictions}
                    update_predictions={new_predictions => upsert_wcomponent({ validity: new_predictions }) }
                />
            </p>

            <hr />
            <br />
        </div>}


        {wcomponent_has_existence_predictions(wcomponent) && wcomponent.existence.length && <div>
            <p style={{ color: "red" }}>
                <PredictionList
                    item_descriptor="(Deprecated, please delete) Existence prediction"
                    predictions={wcomponent_has_existence_predictions(wcomponent) ? wcomponent.existence : []}
                    update_predictions={new_predictions => upsert_wcomponent({
                        existence: new_predictions.length ? new_predictions : undefined
                    })}
                />
            </p>

            <hr />
            <br />
        </div>}


        {(orig_values_and_prediction_sets !== undefined && (editing || orig_values_and_prediction_sets.length > 0)) && <div>
            <p>
                {VAPs_represent === VAPsType.undefined && <div>
                    Values: Set subtype to view
                </div>}
                {VAPs_represent !== VAPsType.undefined && <ValueAndPredictionSets
                    wcomponent_id={wcomponent.id}
                    VAPs_represent={VAPs_represent}
                    existing_value_possibilities={orig_value_possibilities}
                    values_and_prediction_sets={orig_values_and_prediction_sets}
                    update_values_and_predictions={({ value_possibilities, values_and_prediction_sets }) =>
                    {
                        upsert_wcomponent({ value_possibilities, values_and_prediction_sets })
                    }}
                />}
            </p>

            <hr />
            <br />
            {VAPs_represent !== VAPsType.undefined && <div>
                <ValuePossibilitiesComponent
                    editing={editing}
                    VAPs_represent={VAPs_represent}
                    value_possibilities={orig_value_possibilities}
                    values_and_prediction_sets={orig_values_and_prediction_sets}
                    update_value_possibilities={value_possibilities =>
                    {
                        const values_and_prediction_sets = update_VAPSets_with_possibilities(orig_values_and_prediction_sets, value_possibilities)
                        upsert_wcomponent({ value_possibilities, values_and_prediction_sets })
                    }}
                />
                <hr />
                <br />
            </div>}
        </div>}



        {wcomponent_has_objectives(wcomponent) && <ChosenObjectivesFormFields { ...{ wcomponent, upsert_wcomponent }} /> }
        <FormControl fullWidth={true}>
            <EditableCustomDateTime
                title="Created at"
                invariant_value={wcomponent.created_at}
                value={wcomponent.custom_created_at}
                on_change={new_custom_created_at => {
                    upsert_wcomponent({ custom_created_at: new_custom_created_at })
                }}
            /><br/>

            {/*
            <MaterialDateTime
                fullWidth={true}
                on_change={new_custom_created_at => {
                   upsert_wcomponent({ custom_created_at: new_custom_created_at })
                }}
                title="Created at"
                type={(props.time_resolution === 'day') ? "date" : "datetime"}
                invariant_value={wcomponent.created_at}
                value={wcomponent.custom_created_at}
            />
            */}
        </FormControl>

        {editing && <p>
            <span className="description_label">Label color</span>
            <ColorPicker
                color={wcomponent.label_color}
                conditional_on_blur={color => upsert_wcomponent({ label_color: color })}
            />
        </p>}

        {editing && <WComponentImageForm
            wcomponent={wcomponent}
            upsert_wcomponent={upsert_wcomponent}
        />}

        {editing && <p>
            <span className="description_label">Hide node title</span>
            <EditableCheckbox
                value={wcomponent.hide_title}
                on_change={hide_title => upsert_wcomponent({ hide_title })}
            />
            <span className="description_label">Hide node state</span>
            <EditableCheckbox
                value={wcomponent.hide_state}
                on_change={hide_state => upsert_wcomponent({ hide_state })}
            />

            <hr />
        </p>}


        <p>
            <WComponentKnowledgeViewForm wcomponent_id={wcomponent_id} />
        </p>


        <br />
        {/* <hr /> */}
        <br />


        {editing && !wcomponent.deleted_at && <div>
            <ConfirmatoryDeleteButton
                button_text="Delete"
                tooltip_text="Remove from all knowledge views"
                on_delete={() => props.delete_wcomponent({ wcomponent_id })}
            />
        </div>}

        {editing && wcomponent.deleted_at && <div>
            <Button
                title="Undo delete"
                onClick={() => props.upsert_wcomponent({ wcomponent: { ...wcomponent, deleted_at: undefined } })}
            >Restore</Button>
        </div>}


        <br />
    </Box>
}

export const WComponentForm = connector(_WComponentForm) as FunctionComponent<OwnProps>


const wcomponent_type_options = wcomponent_types.map(type => ({ id: type, title: wcomponent_type_to_text(type) }))
const wcomponent_statev2_subtype_options = wcomponent_statev2_subtypes.map(type => ({ id: type, title: type }))
