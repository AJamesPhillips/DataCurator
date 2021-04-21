import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AutocompleteText } from "../../form/AutocompleteText"
import { ConfirmatoryDeleteButton } from "../../form/ConfirmatoryDeleteButton"
import { EditableCustomDateTime } from "../../form/EditableCustomDateTime"
import { EditableText } from "../../form/EditableText"
import { replace_value_in_text } from "../../shared/models/get_rich_text"
import { get_updated_wcomponent } from "../../shared/models/get_updated_wcomponent"
import { get_wcomponent_state_value } from "../../shared/models/get_wcomponent_state_value"
import {
    WComponent,
    wcomponent_is_plain_connection,
    wcomponent_is_state,
    wcomponent_is_judgement,
    wcomponent_is_statev2,
    wcomponent_has_validity_predictions,
    wcomponent_has_existence_predictions,
    wcomponent_types,
} from "../../shared/models/interfaces/SpecialisedObjects"
import { wcomponent_statev2_subtypes } from "../../shared/models/interfaces/state"
import { ACTIONS } from "../../state/actions"
import { get_wcomponent_from_state } from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { ValueAndPredictionSets } from "../multiple_values/ValueAndPredictionSets"
import { PredictionList } from "../predictions/PredictionList"
import { ValueList } from "../values/ValueList"
import { WComponentFromTo } from "../WComponentFromTo"
import { WComponentKnowledgeView } from "../WComponentKnowledgeView"
import { WComponentLatestPrediction } from "../WComponentLatestPrediction"
import { JudgementFields } from "./JudgementFields"



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

    return {
        ready: state.sync.ready,
        from_wcomponent,
        to_wcomponent,
        // keys: state.global_keys,
        x: state.routing.args.x,
        y: state.routing.args.y,
        zoom: state.routing.args.zoom,
        rich_text: state.display.rich_text_formatting,
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

    const { wcomponent, from_wcomponent, to_wcomponent, rich_text } = props
    const wcomponent_id = wcomponent.id

    const upsert_wcomponent = (partial_wcomponent: Partial<WComponent>) =>
    {
        const updated = get_updated_wcomponent(wcomponent, partial_wcomponent).wcomponent
        props.upsert_wcomponent({ wcomponent: updated })
    }


    const value = get_wcomponent_state_value(wcomponent)

    return <div key={wcomponent_id}>
        <h2><EditableText
            placeholder={"Title..."}
            value={rich_text ? replace_value_in_text({ text: wcomponent.title, wcomponent }) : wcomponent.title}
            on_change={title => upsert_wcomponent({ title })}
        /></h2>

        {wcomponent_is_state(wcomponent) && value &&
        <div style={{ cursor: "not-allowed" }}>
            Value: {value}
        </div>}

        {wcomponent_is_statev2(wcomponent) &&
        <div style={{ cursor: "not-allowed" }}>
            Value: {}
        </div>}

        <WComponentLatestPrediction wcomponent={wcomponent} />

        <p>Type: <div style={{ width: "60%", display: "inline-block" }}><AutocompleteText
            placeholder={"Type..."}
            selected_option_id={wcomponent.type}
            get_options={() => wcomponent_type_options}
            on_change={option_id => upsert_wcomponent({ type: option_id })}
        /></div></p>

        {wcomponent_is_statev2(wcomponent) &&
        <p>Sub type: <div style={{ width: "60%", display: "inline-block" }}>
            <AutocompleteText
                placeholder={"Sub type..."}
                selected_option_id={wcomponent.subtype}
                get_options={() => wcomponent_statev2_subtype_options}
                on_change={option_id => upsert_wcomponent({ subtype: option_id })}
            />
        </div></p>}

        {wcomponent_is_plain_connection(wcomponent) && <p>
            <WComponentFromTo
                connection_terminal_type="effector"
                parent_wcomponent_id={wcomponent_id}
                wcomponent={from_wcomponent}
                on_update={from_id => upsert_wcomponent({ from_id })}
            />
        </p>}

        {wcomponent_is_plain_connection(wcomponent) && <p>
            <WComponentFromTo
                connection_terminal_type="effected"
                parent_wcomponent_id={wcomponent_id}
                wcomponent={to_wcomponent}
                on_update={to_id => upsert_wcomponent({ to_id })}
            />
        </p>}

        {wcomponent_is_judgement(wcomponent) && <JudgementFields { ...{ wcomponent, upsert_wcomponent }} /> }

        <p><EditableText
            placeholder={"Description..."}
            value={wcomponent.description}
            on_change={description => upsert_wcomponent({ description })}
        /></p>

        <p title={(wcomponent.custom_created_at ? "Custom " : "") + "Created at"}>
            <EditableCustomDateTime
                invariant_value={wcomponent.created_at}
                value={wcomponent.custom_created_at}
                on_change={new_custom_created_at => upsert_wcomponent({ custom_created_at: new_custom_created_at })}
            />
        </p>

        <br />

        {wcomponent_has_validity_predictions(wcomponent) && <div>
            <p>
                <PredictionList
                    item_descriptor="Validity"
                    predictions={wcomponent.validity}
                    update_predictions={new_predictions => upsert_wcomponent({ validity: new_predictions }) }
                />
            </p>

            <hr />
            <br />
        </div>}

        {wcomponent_has_existence_predictions(wcomponent) && <div>
            <p>
                <PredictionList
                    item_descriptor="Existence"
                    predictions={wcomponent.existence}
                    update_predictions={new_predictions => upsert_wcomponent({ existence: new_predictions }) }
                />
            </p>

            <hr />
            <br />
        </div>}

        {wcomponent_is_state(wcomponent) && <div>
            <p>
                <ValueList
                    values={wcomponent.values || []}
                    update_values={new_values => upsert_wcomponent({ values: new_values }) }
                />
            </p>

            <hr />
            <br />
        </div>}

        {wcomponent_is_statev2(wcomponent) && <div>
            <p>
                <ValueAndPredictionSets
                    subtype={wcomponent.subtype}
                    values_and_prediction_sets={wcomponent.values_and_prediction_sets || []}
                    update_values_and_predictions={values_and_prediction_sets =>
                    {
                        upsert_wcomponent({ values_and_prediction_sets })
                    }}
                />
            </p>

            <hr />
            <br />
        </div>}

        <p>
            <WComponentKnowledgeView wcomponent_id={wcomponent_id} />
        </p>

        <hr />

        <ConfirmatoryDeleteButton
            // on_delete={() => props.delete_wcomponent({ wcomponent_id })}
            on_delete={() => alert("Deleting disabled: need to implement tombstones.  Either remove node from this view or use for something useful.")}
        />
        <div style={{ float: "right" }}>(Disabled)&nbsp;</div>

        <br />

        {/* <hr /> */}
        {/* {Array.from(props.keys.keys_down).join(", ")} */}

    </div>
}

export const WComponentForm = connector(_WComponentForm) as FunctionComponent<OwnProps>


const wcomponent_type_options = wcomponent_types.map(type => ({ id: type, title: type }))
const wcomponent_statev2_subtype_options = wcomponent_statev2_subtypes.map(type => ({ id: type, title: type }))
