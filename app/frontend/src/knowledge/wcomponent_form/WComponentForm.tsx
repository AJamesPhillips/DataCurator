import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AutocompleteText } from "../../form/Autocomplete/AutocompleteText"
import { EditableCustomDateTime } from "../../form/EditableCustomDateTime"
import { EditableNumber } from "../../form/EditableNumber"
import { EditableText } from "../../form/EditableText"
import { EditableTextSingleLine } from "../../form/EditableTextSingleLine"
import { get_title } from "../../shared/wcomponent/rich_text/get_rich_text"
import { get_updated_wcomponent } from "../../shared/wcomponent/get_updated_wcomponent"
import { get_wcomponent_state_UI_value } from "../../shared/wcomponent/get_wcomponent_state_UI_value"
import {
    WComponent,
    wcomponent_is_plain_connection,
    wcomponent_is_statev1,
    wcomponent_is_judgement_or_objective,
    wcomponent_is_statev2,
    wcomponent_has_existence_predictions,
    wcomponent_is_event,
    wcomponent_is_causal_link,
    wcomponent_should_have_state_VAP_sets,
    wcomponent_is_goal,
    wcomponent_can_have_validity_predictions,
    wcomponent_is_prioritisation,
} from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import { StateValueAndPredictionsSet, wcomponent_statev2_subtypes } from "../../shared/wcomponent/interfaces/state"
import { wcomponent_types } from "../../shared/wcomponent/interfaces/wcomponent_base"
import { ACTIONS } from "../../state/actions"
import { get_wc_id_counterfactuals_map } from "../../state/derived/accessor"
import { get_wcomponent_from_state } from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { DisplayValue } from "../multiple_values/DisplayValue"
import { ValueAndPredictionSets } from "../multiple_values/ValueAndPredictionSets"
import { PredictionList } from "../predictions/PredictionList"
import { ValueList } from "../values/ValueList"
import { WComponentFromTo } from "../WComponentFromTo"
import { WComponentKnowledgeView } from "../WComponentKnowledgeView"
import { WComponentLatestPrediction } from "../WComponentLatestPrediction"
import { JudgementFormFields } from "./JudgementFormFields"
import { useEffect, useRef } from "preact/hooks"
import { WComponentEventAtFormField } from "./WComponentEventAtFormField"
import type { UIValue } from "../../shared/wcomponent/interfaces/generic_value"
import { wcomponent_VAPs_represent } from "../../shared/wcomponent/value_and_prediction/utils"
import { GoalFormFields } from "./GoalFormFields"
import { WComponentDateTimeFormField } from "./WComponentDateTimeFormField"
import { get_contextless_new_wcomponent_object } from "../../shared/wcomponent/get_new_wcomponent_object"
import { LabelsEditor } from "./LabelsEditor"
import { ColorPicker } from "../../sharedf/ColorPicker"



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
        ready: state.sync.ready,
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        wc_id_counterfactuals_map,
        from_wcomponent,
        to_wcomponent,
        // keys: state.global_keys,
        x: state.routing.args.x,
        y: state.routing.args.y,
        zoom: state.routing.args.zoom,
        editing: !state.display_options.consumption_formatting,
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
        creation_context: state.creation_context,
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
    if (!props.ready) return <div>Loading...</div>

    const { wcomponent, wcomponents_by_id, wc_id_counterfactuals_map, from_wcomponent, to_wcomponent, editing, created_at_ms, sim_ms, creation_context } = props
    const wcomponent_id = wcomponent.id
    const wc_counterfactuals = wc_id_counterfactuals_map && wc_id_counterfactuals_map[wcomponent_id]


    const previous_id = useRef<undefined | string>(undefined)
    useEffect(() => { previous_id.current = wcomponent_id }, [wcomponent_id])


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


    return <div key={wcomponent_id}>
        <h2><EditableText
            placeholder={wcomponent.type === "action" ? "Passive imperative title..." : "Title..."}
            value={get_title({ rich_text: !editing, wcomponent, wcomponents_by_id, wc_id_counterfactuals_map, created_at_ms, sim_ms })}
            on_blur={title => upsert_wcomponent({ title })}
            force_focus={previous_id.current !== wcomponent_id}
        /></h2>


        <WComponentLatestPrediction wcomponent={wcomponent} />


        {UI_value && (editing || UI_value.is_defined) &&
        <div style={{ cursor: "not-allowed" }}>
            <span className="description_label">Value</span>
            <DisplayValue UI_value={UI_value} />
        </div>}


        <p>
            <span className="description_label">Type</span>&nbsp;
            <div style={{ width: "60%", display: "inline-block" }}>
                <AutocompleteText
                    placeholder={"Type..."}
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
            </div>
        </p>


        {wcomponent_is_statev2(wcomponent) &&
        <p>
            <span className="description_label">Sub type</span>&nbsp;
            <div style={{ width: "60%", display: "inline-block" }}>
                <AutocompleteText
                    placeholder={"Sub type..."}
                    selected_option_id={wcomponent.subtype}
                    options={wcomponent_statev2_subtype_options}
                    on_change={option_id => upsert_wcomponent({ subtype: option_id })}
                />
            </div>
        </p>}


        {wcomponent_is_statev2(wcomponent) && wcomponent.subtype === "boolean" && (editing || wcomponent.boolean_true_str || wcomponent.boolean_false_str) &&
        <p>
            <div style={{ display: "inline-flex" }}>
                <span className="description_label">Boolean representation</span>&nbsp;
                <EditableTextSingleLine
                    placeholder="True..."
                    value={wcomponent.boolean_true_str || ""}
                    on_change={boolean_true_str => upsert_wcomponent({ boolean_true_str })}
                />
                <EditableTextSingleLine
                    placeholder="False..."
                    value={wcomponent.boolean_false_str || ""}
                    on_change={boolean_false_str => upsert_wcomponent({ boolean_false_str })}
                />
            </div>
        </p>}


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

        {wcomponent_is_causal_link(wcomponent) && <p>
            Effect when true: <EditableNumber
                placeholder="..."
                value={wcomponent.effect_when_true}
                allow_undefined={true}
                on_change={effect_when_true => upsert_wcomponent({ effect_when_true })}
            />
        </p>}

        {wcomponent_is_causal_link(wcomponent) && <p>
            Effect when false: <EditableNumber
                placeholder="..."
                value={wcomponent.effect_when_false}
                allow_undefined={true}
                on_change={effect_when_false => upsert_wcomponent({ effect_when_false })}
            />
        </p>}

        {wcomponent_is_judgement_or_objective(wcomponent) && <JudgementFormFields { ...{ wcomponent, upsert_wcomponent }} /> }

        {(editing || wcomponent.description) && <p>
            <EditableText
                placeholder="Description..."
                value={wcomponent.description}
                on_blur={description => upsert_wcomponent({ description })}
            />
        </p>}


        {(editing || (wcomponent.label_ids && wcomponent.label_ids.length > 0)) && <p>
            <LabelsEditor
                label_ids={wcomponent.label_ids}
                on_change={label_ids => upsert_wcomponent({ label_ids })}
            />
        </p>}


        {wcomponent_is_event(wcomponent)&& <WComponentEventAtFormField
            wcomponent={wcomponent}
            upsert_wcomponent={upsert_wcomponent}
        />}

        {wcomponent_is_prioritisation(wcomponent) && <WComponentDateTimeFormField
            wcomponent={wcomponent}
            upsert_wcomponent={upsert_wcomponent}
        />}


        <p title={(wcomponent.custom_created_at ? "Custom " : "") + "Created at"} style={{ display: "inline-flex" }}>
            <span className="description_label">Created at</span> &nbsp; <EditableCustomDateTime
                invariant_value={wcomponent.created_at}
                value={wcomponent.custom_created_at}
                on_change={new_custom_created_at => upsert_wcomponent({ custom_created_at: new_custom_created_at })}
            />
        </p>


        {orig_validity_predictions && (editing || orig_validity_predictions.length > 0) && <div>
            <br />

            <p>
                <PredictionList
                    item_descriptor="Validity prediction"
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
                {VAPs_represent.undefined && <div>
                    Values: Set subtype to view
                </div>}
                {!VAPs_represent.undefined && <ValueAndPredictionSets
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


        {wcomponent_is_statev1(wcomponent) && <div>
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



        {props.editing && <p>
            <span className="description_label">Label color</span>
            <ColorPicker
                color={wcomponent.label_color}
                on_blur={color => upsert_wcomponent({ label_color: color })}
            />

            <hr />
        </p>}


        <p>
            <WComponentKnowledgeView wcomponent_id={wcomponent_id} />
        </p>


        {/*
        <hr />

        <ConfirmatoryDeleteButton
            // on_delete={() => props.delete_wcomponent({ wcomponent_id })}
            on_delete={() => alert("Deleting disabled: need to implement tombstones.  Either remove node from this view or use for something useful.")}
        />
        <div style={{ float: "right" }}>(Disabled)&nbsp;</div> */}

        <br />
    </div>
}

export const WComponentForm = connector(_WComponentForm) as FunctionComponent<OwnProps>


const wcomponent_type_options = wcomponent_types.map(type => ({ id: type, title: type }))
const wcomponent_statev2_subtype_options = wcomponent_statev2_subtypes.map(type => ({ id: type, title: type }))
