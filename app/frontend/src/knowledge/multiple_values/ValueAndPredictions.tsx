import { h } from "preact"

import "./ValueAndPredictions.css"
import type { StateValueAndPrediction, WComponentStateV2SubType } from "../../shared/models/interfaces/state"
import { EditableList } from "../../form/editable_list/EditableList"
import { EditableTextSingleLine } from "../../form/EditableTextSingleLine"
import { EditablePercentage } from "../../form/EditablePercentage"
import { EditableNumber } from "../../form/EditableNumber"
import { prepare_new_vap } from "./utils"
import { EditableText } from "../../form/EditableText"



interface OwnProps
{
    created_at: Date
    subtype: WComponentStateV2SubType
    values_and_predictions: StateValueAndPrediction[]
    update_values_and_predictions: (values_and_predictions: StateValueAndPrediction[]) => void
}



export function ValueAndPredictions (props: OwnProps)
{
    const class_name_only_one_vap = props.subtype === "boolean" ? "only_one_vap" : ""

    return <div className={`value_and_predictions ${class_name_only_one_vap}`}>
        <EditableList
            items={props.values_and_predictions}
            item_descriptor="Value and prediction"
            get_id={get_id}
            get_created_at={() => props.created_at}
            get_summary={get_summary(props.subtype)}
            get_details={get_details(props.subtype)}
            prepare_new_item={prepare_new_vap}
            update_items={items => props.update_values_and_predictions(items)}
            entries_extra_class_names="value_and_prediction"
            disable_collapsed={true}
            disable_partial_collapsed={true}
        />
    </div>
}


const get_id = (item: StateValueAndPrediction) => item.id


const get_summary = (subtype: WComponentStateV2SubType) => (item: StateValueAndPrediction, on_change: (item: StateValueAndPrediction) => void): h.JSX.Element =>
{
    const is_boolean = subtype === "boolean"
    const has_rel_prob = item.relative_probability !== undefined
    const disabled_prob = has_rel_prob && !is_boolean
    const disabled_rel_prob = !has_rel_prob || is_boolean

    return <div className="value_and_prediction_summary">
        <div className="temporal_uncertainty">
            {!is_boolean && <div>
                min: &nbsp; <EditableTextSingleLine
                    placeholder="..."
                    value={item.min || ""}
                    on_change={min => on_change({ ...item, min })}
                />
            </div>}
            <div>
                value: &nbsp; <EditableTextSingleLine
                    disabled={is_boolean}
                    placeholder="..."
                    value={is_boolean ? "True" : item.value}
                    on_change={value => on_change({ ...item, value })}
                />
            </div>
            {!is_boolean && <div>
                max: &nbsp; <EditableTextSingleLine
                    placeholder="..."
                    value={item.max || ""}
                    on_change={max => on_change({ ...item, max })}
                />
            </div>}
        </div>
        <div className="probabilities">
            <div className={disabled_prob ? "disabled" : ""}>
                Prob: &nbsp; <EditablePercentage
                    disabled={disabled_prob}
                    placeholder="..."
                    value={item.probability}
                    on_change={probability => on_change({ ...item, probability })}
                />
            </div>
            <div className={disabled_rel_prob ? "disabled" : ""}>
                Rel prob: &nbsp; <EditableNumber
                    disabled={disabled_rel_prob}
                    placeholder="..."
                    value={is_boolean ? undefined : item.relative_probability}
                    allow_undefined={true}
                    on_change={relative_probability => on_change({ ...item, relative_probability })}
                />
            </div>
            <div>
                Confidence: &nbsp; <EditablePercentage
                    placeholder="..."
                    value={item.conviction}
                    on_change={conviction => on_change({ ...item, conviction })}
                />
            </div>
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
