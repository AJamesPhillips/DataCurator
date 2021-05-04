import { h } from "preact"
import { useMemo } from "preact/hooks"

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



interface OwnProps
{
    created_at: Date
    subtype: WComponentStateV2SubType
    values_and_predictions: StateValueAndPrediction[]
    update_values_and_predictions: (values_and_predictions: StateValueAndPrediction[]) => void
}



export function ValueAndPredictions (props: OwnProps)
{
    const VAPs = props.values_and_predictions
    const class_name_only_one_VAP = (props.subtype === "boolean" && VAPs.length >= 1) ? "only_one_VAP" : ""

    const item_top_props = useMemo(() => {
        const props2: EditableListEntryTopProps<StateValueAndPrediction> = {
            get_created_at: () => props.created_at,
            get_summary: get_summary(props.subtype),
            get_details: get_details(props.subtype),
            extra_class_names: "value_and_prediction",
        }

        return props2
    }, [props.created_at.getTime(), props.subtype])


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
