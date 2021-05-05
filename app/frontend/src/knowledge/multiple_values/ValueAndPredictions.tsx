import { FunctionalComponent, h } from "preact"

import "./ValueAndPredictions.css"
import { EditableNumber } from "../../form/EditableNumber"
import { EditablePercentage } from "../../form/EditablePercentage"
import { EditableText } from "../../form/EditableText"
import { EditableTextSingleLine } from "../../form/EditableTextSingleLine"
import type { EditableListEntryTopProps } from "../../form/editable_list/EditableListEntry"
import { get_items_descriptor } from "../../form/editable_list/ExpandableList"
import { ListHeader } from "../../form/editable_list/ListHeader"
import { ListHeaderAddButton } from "../../form/editable_list/ListHeaderAddButton"
import { factory_render_list_content } from "../../form/editable_list/render_list_content"
import type { WComponentStateV2SubType, StateValueAndPrediction } from "../../shared/models/interfaces/state"
import { prepare_new_VAP } from "./utils"
import { PredictionBadge } from "../predictions/PredictionBadge"
import { connect, ConnectedProps } from "react-redux"
import type { RootState } from "../../state/State"
import { get_current_UI_knowledge_view_from_state } from "../../state/specialised_objects/accessors"
import { ACTIONS } from "../../state/actions"
import type { WComponentCounterfactual } from "../../shared/models/interfaces/uncertainty"
import type { VAP_id_counterfactual_map } from "../../state/derived/State"
import { get_new_wcomponent_object } from "../create_wcomponent_type"
import { is_counterfactual_active } from "../counterfactuals/active"
import { merge_counterfactual_into_VAP } from "../counterfactuals/merge"



interface OwnProps
{
    wcomponent_id?: string
    VAP_set_id?: string
    created_at: Date
    subtype: WComponentStateV2SubType
    values_and_predictions: StateValueAndPrediction[]
    VAP_counterfactuals_map?: VAP_id_counterfactual_map
    update_values_and_predictions: (values_and_predictions: StateValueAndPrediction[]) => void
}



const map_state = (state: RootState) => {
    const current_UI_knowledge_view = get_current_UI_knowledge_view_from_state(state)

    const allows_assumptions = !!(current_UI_knowledge_view && current_UI_knowledge_view.allows_assumptions)

    return {
        allows_assumptions,
        knowledge_view_id: current_UI_knowledge_view && current_UI_knowledge_view.id,
    }
}



const map_dispatch = {
    upsert_counterfactual: (cf: WComponentCounterfactual, knowledge_view_id: string) =>
    {
        return ACTIONS.specialised_object.upsert_wcomponent({
            wcomponent: cf,
            add_to_knowledge_view: { id: knowledge_view_id, position: { left: 0, top: 0 } }
        })
    }
}



const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _ValueAndPredictions (props: Props)
{
    const VAPs = props.values_and_predictions
    const class_name_only_one_VAP = (props.subtype === "boolean" && VAPs.length >= 1) ? "only_one_VAP" : ""

    const item_top_props: EditableListEntryTopProps<StateValueAndPrediction> = {
        get_created_at: () => props.created_at,
        get_summary: get_summary({
            subtype: props.subtype,
            allows_assumptions: props.allows_assumptions,
            VAP_counterfactuals_map: props.VAP_counterfactuals_map,
            upsert_counterfactual: props.upsert_counterfactual,
            knowledge_view_id: props.knowledge_view_id,
            wcomponent_id: props.wcomponent_id,
            VAP_set_id: props.VAP_set_id,
        }),
        get_details: get_details(props.subtype),
        extra_class_names: "value_and_prediction",
    }

    const item_descriptor = "Value and prediction"


    return <div className={`value_and_predictions ${class_name_only_one_VAP}`}>
        <ListHeader
            items_descriptor={get_items_descriptor(item_descriptor, VAPs.length)}
            other_content={() => <ListHeaderAddButton
                new_item_descriptor={item_descriptor}
                on_pointer_down_new_list_entry={() => {
                    props.update_values_and_predictions([
                        ...VAPs, prepare_new_VAP(),
                    ])}
                }
            />}
        />

        {factory_render_list_content({
            items: VAPs,
            get_id,
            item_top_props,
            item_descriptor,
            update_items: props.update_values_and_predictions,
        })({ expanded_item_rows: true, expanded_items: true, disable_partial_collapsed: false })}
    </div>
}

export const ValueAndPredictions = connector(_ValueAndPredictions) as FunctionalComponent<OwnProps>



const get_id = (item: StateValueAndPrediction) => item.id



interface GetSummaryArgs
{
    subtype: WComponentStateV2SubType
    allows_assumptions: boolean
    VAP_counterfactuals_map: VAP_id_counterfactual_map | undefined
    knowledge_view_id: string | undefined
    wcomponent_id: string | undefined
    VAP_set_id: string | undefined
    upsert_counterfactual: (counterfactual: WComponentCounterfactual, knowledge_view_id: string) => void
}
const get_summary = (args: GetSummaryArgs) => (VAP: StateValueAndPrediction, on_change: (item: StateValueAndPrediction) => void): h.JSX.Element =>
{
    const { subtype, allows_assumptions, VAP_counterfactuals_map, knowledge_view_id,
        wcomponent_id, VAP_set_id, upsert_counterfactual } = args

    const counterfactual = VAP_counterfactuals_map && VAP_counterfactuals_map[VAP.id]
    const counterfactual_active = is_counterfactual_active(counterfactual)
    const { probability, conviction } = merge_counterfactual_into_VAP(VAP, counterfactual)

    const is_boolean = subtype === "boolean"
    const has_rel_prob = VAP.relative_probability !== undefined
    const disabled_prob = has_rel_prob && !is_boolean || counterfactual_active
    const disabled_rel_prob = !has_rel_prob || is_boolean
    const disabled_conviction = counterfactual_active

    const disabled_setting_counterfactual = !allows_assumptions || !knowledge_view_id || !wcomponent_id || !VAP_set_id

    return <div className="value_and_prediction_summary">
        <div className="temporal_uncertainty">
            {!is_boolean && <div>
                min: &nbsp; <EditableTextSingleLine
                    placeholder="..."
                    value={VAP.min || ""}
                    on_change={min => on_change({ ...VAP, min })}
                />
            </div>}
            <div>
                value: &nbsp; <EditableTextSingleLine
                    disabled={is_boolean}
                    placeholder="..."
                    value={is_boolean ? "True" : VAP.value}
                    on_change={value => on_change({ ...VAP, value })}
                />
            </div>
            {!is_boolean && <div>
                max: &nbsp; <EditableTextSingleLine
                    placeholder="..."
                    value={VAP.max || ""}
                    on_change={max => on_change({ ...VAP, max })}
                />
            </div>}
        </div>
        <div className="probabilities">
            <div className={disabled_prob ? "disabled" : ""}>
                Prob: &nbsp; <EditablePercentage
                    disabled={disabled_prob}
                    placeholder="..."
                    value={probability}
                    on_change={probability => on_change({ ...VAP, probability })}
                />
            </div>
            <div className={disabled_rel_prob ? "disabled" : ""}>
                Rel prob: &nbsp; <EditableNumber
                    disabled={disabled_rel_prob}
                    placeholder="..."
                    value={is_boolean ? undefined : VAP.relative_probability}
                    allow_undefined={true}
                    on_change={relative_probability => on_change({ ...VAP, relative_probability })}
                />
            </div>
            <div className={disabled_conviction ? "disabled" : ""}>
                Cn: &nbsp; <EditablePercentage
                    disabled={disabled_conviction}
                    placeholder="..."
                    value={conviction}
                    on_change={conviction => on_change({ ...VAP, conviction })}
                />
            </div>

            <PredictionBadge
                disabled={disabled_setting_counterfactual}
                size={20}
                probability={VAP.probability}
                conviction={VAP.conviction}
                counterfactual_probability={counterfactual && counterfactual.probability}
                counterfactual_conviction={counterfactual && counterfactual.conviction}
                set_counterfactual={args =>
                {
                    if (!knowledge_view_id || !wcomponent_id || !VAP_set_id) return

                    let cf = (counterfactual || get_new_wcomponent_object({
                        type: "counterfactual",
                        target_wcomponent_id: wcomponent_id,
                        target_VAP_set_id: VAP_set_id,
                        target_VAP_id: VAP.id,
                    }) as WComponentCounterfactual)

                    cf = { ...cf, ...args }
                    upsert_counterfactual(cf, knowledge_view_id)
                }}
            />
        </div>
    </div>
}


const get_details = (subtype: WComponentStateV2SubType) => (item: StateValueAndPrediction, on_change: (item: StateValueAndPrediction) => void): h.JSX.Element =>
{
    const is_boolean = subtype === "boolean"

    return <div>
        {!is_boolean && <br />}
        {!is_boolean && <div>
            Description:
            <EditableText
                placeholder="..."
                value={item.description}
                on_change={description => on_change({ ...item, description })}
            />
        </div>}
        <br />
        <div>
            Explanation:
            <EditableText
                placeholder="..."
                value={item.explanation}
                on_change={explanation => on_change({ ...item, explanation })}
            />
        </div>
    </div>
}
