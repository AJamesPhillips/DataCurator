import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { useEffect, useRef, useState } from "preact/hooks"
import { Box, FormControl, FormControlLabel, FormLabel, InputLabel, Typography } from "@material-ui/core"

import { AutocompleteText } from "../../form/Autocomplete/AutocompleteText"
import { ConfirmatoryDeleteButton } from "../../form/ConfirmatoryDeleteButton"
import { EditableCheckbox } from "../../form/EditableCheckbox"
import { EditableCustomDateTime } from "../../form/EditableCustomDateTime"
import { EditableText } from "../../form/editable_text/EditableText"
import { EditableTextSingleLine } from "../../form/editable_text/EditableTextSingleLine"
import { LabelsEditor } from "../../labels/LabelsEditor"
import { get_contextless_new_wcomponent_object } from "../../shared/wcomponent/get_new_wcomponent_object"
import { get_updated_wcomponent } from "../../shared/wcomponent/get_updated_wcomponent"
import { get_wcomponent_state_UI_value } from "../../shared/wcomponent/get_wcomponent_state_UI_value"
import { UIValue, VAPsType } from "../../shared/wcomponent/interfaces/generic_value"
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
    wcomponent_is_statev1,
    wcomponent_is_goal,
} from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import { StateValueAndPredictionsSet, wcomponent_statev2_subtypes } from "../../shared/wcomponent/interfaces/state"
import { wcomponent_types } from "../../shared/wcomponent/interfaces/wcomponent_base"
import { get_title } from "../../shared/wcomponent/rich_text/get_rich_text"
import { wcomponent_VAPs_represent } from "../../shared/wcomponent/value_and_prediction/utils"
import { wcomponent_type_to_text } from "../../shared/wcomponent/wcomponent_type_to_text"
import { ColorPicker } from "../../sharedf/ColorPicker"
import { ACTIONS } from "../../state/actions"
import { get_wc_id_counterfactuals_map } from "../../state/derived/accessor"
import { get_wcomponent_from_state } from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { DisplayValue } from "../multiple_values/DisplayValue"
import { ValueAndPredictionSets } from "../multiple_values/ValueAndPredictionSets"
import { PredictionList } from "../predictions/PredictionList"
import { ValueList } from "../values/ValueList"
import { WComponentFromTo } from "../WComponentFromTo"
import { WComponentLatestPrediction } from "../WComponentLatestPrediction"
import { GoalFormFields } from "./GoalFormFields"
import { JudgementFormFields } from "./JudgementFormFields"
import { WComponentCausalLinkForm } from "./WComponentCausalLinkForm"
import { WComponentCounterfactualForm } from "./WComponentCounterfactualForm"
import { WComponentDateTimeFormField } from "./WComponentDateTimeFormField"
import { WComponentEventAtFormField } from "./WComponentEventAtFormField"
import { WComponentKnowledgeViewForm } from "./WComponentKnowledgeViewForm"



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


    const wc_id_counterfactuals_map = get_wc_id_counterfactuals_map(state)


    return {
        ready: state.sync.ready_for_reading,
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        wc_id_counterfactuals_map,
        from_wcomponent,
        to_wcomponent,
        editing: !state.display_options.consumption_formatting,
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
        creation_context: state.creation_context,
        storage_type_supports_delete: state.sync.storage_type !== "local_server",
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

    if (!props.ready) return <div>Loading...</div>


    const { wcomponent, wcomponents_by_id, wc_id_counterfactuals_map, from_wcomponent, to_wcomponent,
        editing, created_at_ms, sim_ms, creation_context } = props
    const wc_counterfactuals = wc_id_counterfactuals_map && wc_id_counterfactuals_map[wcomponent_id]


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


    const VAPs_represent = wcomponent_VAPs_represent(wcomponent)
    let UI_value: UIValue | undefined = undefined
    let orig_values_and_prediction_sets: StateValueAndPredictionsSet[] | undefined = undefined
    if (wcomponent_should_have_state_VAP_sets(wcomponent))
    {
        UI_value = get_wcomponent_state_UI_value({ wcomponent, wc_counterfactuals, created_at_ms, sim_ms })
        orig_values_and_prediction_sets = wcomponent.values_and_prediction_sets || []
    }


    return <Box  className={`editable-${wcomponent_id}`}>

        <FormControl fullWidth={true} margin="normal" style={{ fontWeight: 600, fontSize: 22 }}>
            <EditableText
                placeholder={wcomponent.type === "action" ? "Passive imperative title..." : (wcomponent.type === "relation_link" ? "Verb..." : "Title...")}
                value={get_title({ rich_text: !editing, wcomponent, wcomponents_by_id, wc_id_counterfactuals_map, created_at_ms, sim_ms })}
                conditional_on_blur={title => upsert_wcomponent({ title })}
                force_focus={focus_title}
            />
        </FormControl>


        <WComponentLatestPrediction wcomponent={wcomponent} />


        {UI_value && (editing || UI_value.is_defined) &&
        <div style={{ cursor: "not-allowed" }}>
            <span className="description_label">Value</span>
            <DisplayValue UI_value={UI_value} />
        </div>}

        <FormControl component="fieldset" fullWidth={true} margin="normal">
            <AutocompleteText
                placeholder="Type: "
                selected_option_id={wcomponent.type}
                options={wcomponent_type_options}
                on_change={type =>
                {
                    if (!type) return

                    // This ensures it will always have the fields it is expected to have
                    const vanilla = get_contextless_new_wcomponent_object({ type }) as WComponent
                    const new_wcomponent = { ...vanilla, ...wcomponent }
                    new_wcomponent.type = type
                    upsert_wcomponent(new_wcomponent)
                }}
            />
        </FormControl>

        {wcomponent_is_statev2(wcomponent) &&
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


        {(editing || wcomponent.description) &&  <FormControl fullWidth={true} margin="normal">
            <EditableText
                placeholder="Description..."
                value={wcomponent.description}
                conditional_on_blur={description => upsert_wcomponent({ description })}
            />
        </FormControl>}

        {wcomponent_is_statev2(wcomponent) && wcomponent.subtype === "boolean" && (editing || wcomponent.boolean_true_str) &&
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
        </FormControl>}



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


        {wcomponent_is_judgement_or_objective(wcomponent) && <JudgementFormFields { ...{ wcomponent, upsert_wcomponent }} /> }


        {(editing || (wcomponent.label_ids && wcomponent.label_ids.length > 0)) &&  <FormControl component="fieldset" fullWidth={true} margin="normal">
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
                    }) }
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
                    values_and_prediction_sets={orig_values_and_prediction_sets}
                    update_values_and_predictions={values_and_prediction_sets =>
                    {
                        upsert_wcomponent({ values_and_prediction_sets })
                    }}
                />}
            </p>

            <hr />
            <br />
        </div>}


        {wcomponent_is_statev1(wcomponent) && (editing || (wcomponent.values || []).length > 0) && <div>
            <p>
                <ValueList
                    values={wcomponent.values || []}
                    update_values={new_values => upsert_wcomponent({ values: new_values }) }
                    creation_context={creation_context}
                />
            </p>

            <hr />
            <br />
        </div>}

        {wcomponent_is_goal(wcomponent) && <GoalFormFields { ...{ wcomponent, upsert_wcomponent }} /> }

        <FormControl fullWidth={true}>
            <EditableCustomDateTime
                title="Created at"
                invariant_value={wcomponent.created_at}
                value={wcomponent.custom_created_at}
                on_change={new_custom_created_at => upsert_wcomponent({ custom_created_at: new_custom_created_at })}
            />
        </FormControl>

        {editing && <p>
            <span className="description_label">Label color</span>
            <ColorPicker
                color={wcomponent.label_color}
                conditional_on_blur={color => upsert_wcomponent({ label_color: color })}
            />
        </p>}


        {editing && <p>
            <span className="description_label">Hide (node) title</span>
            <EditableCheckbox
                value={wcomponent.hide_title}
                on_change={hide_title => upsert_wcomponent({ hide_title })}
            />

            <hr />
        </p>}


        <p>
            <WComponentKnowledgeViewForm wcomponent_id={wcomponent_id} />
        </p>


        <br />
        {/* <hr /> */}
        <br />


        {editing && <div>
            <ConfirmatoryDeleteButton
                disabled={!props.storage_type_supports_delete}
                button_text={"Permanently delete" + (props.storage_type_supports_delete ? "" : " (currently unsupported for local server)")}
                tooltip_text="Permanently remove from all knowledge views"
                on_delete={() => props.delete_wcomponent({ wcomponent_id })}
            />
        </div>}

        <br />
    </Box>
}

export const WComponentForm = connector(_WComponentForm) as FunctionComponent<OwnProps>


const wcomponent_type_options = wcomponent_types.map(type => ({ id: type, title: wcomponent_type_to_text(type) }))
const wcomponent_statev2_subtype_options = wcomponent_statev2_subtypes.map(type => ({ id: type, title: type }))
