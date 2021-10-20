import { FunctionalComponent, h } from "preact"

import "./ValueAndPredictions.css"
import { EditableNumber } from "../../form/EditableNumber"
import { EditablePercentage } from "../../form/EditablePercentage"
import { EditableText } from "../../form/editable_text/EditableText"
import { EditableTextSingleLine } from "../../form/editable_text/EditableTextSingleLine"
import type {
    EditableListEntryItemProps,
    ListItemCRUDRequiredU,
} from "../../form/editable_list/EditableListEntry"
import { get_items_descriptor } from "../../form/editable_list/ExpandableList"
import { ListHeader } from "../../form/editable_list/ListHeader"
import { ListHeaderAddButton } from "../../form/editable_list/ListHeaderAddButton"
import { factory_render_list_content } from "../../form/editable_list/render_list_content"
import type { StateValueAndPrediction } from "../../wcomponent/interfaces/state"
import { prepare_new_VAP } from "../../wcomponent/CRUD_helpers/prepare_new_VAP"
import { PredictionBadge } from "../../sharedf/prediction_badge/PredictionBadge"
import { connect, ConnectedProps } from "react-redux"
import type { RootState } from "../../state/State"
import { VAPsType } from "../../wcomponent/interfaces/VAPsType"
import { remove_element, replace_element } from "../../utils/list"
import type { ValuePossibilitiesById } from "../../wcomponent/interfaces/possibility"
import { ValuePossibilityLink } from "../value_possibilities/ValuePossibilityLink"



interface OwnProps
{
    value_possibilities: ValuePossibilitiesById | undefined
    VAPs_represent: VAPsType
    values_and_predictions: StateValueAndPrediction[]
    update_values_and_predictions: (values_and_predictions: StateValueAndPrediction[]) => void
}



const map_state = (state: RootState) => {
    return {
        editing: !state.display_options.consumption_formatting,
    }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _ValueAndPredictions (props: Props)
{
    const { editing, value_possibilities, VAPs_represent } = props

    const VAPs = props.values_and_predictions
    const class_name_only_one_VAP = (VAPs_represent === VAPsType.boolean && VAPs.length >= 1) ? "only_one_VAP" : ""

    const item_props: EditableListEntryItemProps<StateValueAndPrediction, ListItemCRUDRequiredU<StateValueAndPrediction>> = {
        // Do not show created_at of VAPs when in VAP set
        // get_created_at: () => props.created_at,
        get_summary: get_summary({ value_possibilities, VAPs_represent, editing }),
        get_details: get_details(VAPs_represent, editing),
        extra_class_names: "value_and_prediction",
        crud: {
            update_item: modified_VAP =>
            {
                const id = get_id(modified_VAP)
                const updated_VAPs = replace_element(VAPs, modified_VAP, item => get_id(item) === id)
                props.update_values_and_predictions(updated_VAPs)
            },
            delete_item: VAP_to_delete =>
            {
                const id = get_id(VAP_to_delete)
                const updated_VAPs = remove_element(VAPs, item => get_id(item) === id)
                props.update_values_and_predictions(updated_VAPs)
            }
        },
        delete_button_text: "Delete Value & Prediction",
    }

    const item_descriptor = "Value and prediction"


    return <div className={`value_and_predictions ${class_name_only_one_VAP}`}>
        <ListHeader
            items_descriptor={get_items_descriptor(item_descriptor, VAPs.length)}
            other_content={() => (!editing || VAPs_represent === VAPsType.boolean) ? null : <ListHeaderAddButton
                new_item_descriptor={item_descriptor}
                on_pointer_down_new_list_entry={() =>
                {
                    const vanilla_entries = [...VAPs, prepare_new_VAP() ]
                    props.update_values_and_predictions(vanilla_entries)
                }}
            />}
        />

        {factory_render_list_content({
            items: VAPs,
            get_id,
            item_props,
            debug_item_descriptor: item_descriptor,
        })({ expanded_item_rows: false, expanded_items: true, disable_partial_collapsed: false })}
    </div>
}

export const ValueAndPredictions = connector(_ValueAndPredictions) as FunctionalComponent<OwnProps>



const get_id = (item: StateValueAndPrediction) => item.id



interface GetSummaryArgs
{
    value_possibilities: ValuePossibilitiesById | undefined
    VAPs_represent: VAPsType
    editing: boolean
}
const get_summary = (args: GetSummaryArgs) => (VAP: StateValueAndPrediction, crud: ListItemCRUDRequiredU<StateValueAndPrediction>): h.JSX.Element =>
{
    const { value_possibilities, VAPs_represent, editing } = args

    const {
        probability: orig_probability,
        relative_probability: orig_relative_probability,
        conviction: orig_conviction,
        min: orig_min,
        value: orig_value,
        max: orig_max,
    } = VAP

    const is_boolean = VAPs_represent === VAPsType.boolean
    const is_number = VAPs_represent === VAPsType.number

    const has_rel_prob = orig_relative_probability !== undefined
    const disabled_prob = has_rel_prob && !is_boolean
    const disabled_rel_prob = !has_rel_prob || is_boolean


    return <div className="value_and_prediction_summary">
        <br />
        <div className="temporal_uncertainty">
            {is_number && (editing || orig_min) && <div>
                <EditableTextSingleLine
                    placeholder="Min"
                    value={orig_min || ""}
                    conditional_on_blur={new_min => crud.update_item({ ...VAP, min: new_min })}
                />
                <br />
            </div>}
            {(editing || orig_value) && <div
                style={{ position: "relative" /* Used to position PossibleValueLink*/ }}
            >
                <EditableTextSingleLine
                    disabled={is_boolean}
                    placeholder="Value"
                    value={is_boolean ? (orig_probability > 0.5 ? "True" : "False") : orig_value}
                    conditional_on_blur={value => crud.update_item({ ...VAP, value })}
                />

                {!is_number && !is_boolean && <div
                    style={{ position: "absolute", right: "-25px", top: "15px" }}
                >
                    <ValuePossibilityLink
                        editing={editing}
                        VAP={VAP}
                        value_possibilities={value_possibilities}
                        update_VAP={modified_VAP => crud.update_item(modified_VAP)}
                    />
                </div>}

                <br />
            </div>}
            {is_number && (editing || orig_max) && <div>
                <EditableTextSingleLine
                    placeholder="Max"
                    value={orig_max || ""}
                    conditional_on_blur={max => crud.update_item({ ...VAP, max })}
                />
                <br />
            </div>}
        </div>

        <div className="predictions">
            {is_boolean && <div>
                <EditablePercentage
                    placeholder="Confidence"
                    value={orig_conviction}
                    conditional_on_blur={new_conviction => crud.update_item({ ...VAP, conviction: new_conviction })}
                />
            </div>}

            {is_boolean && <div className={disabled_prob ? "disabled" : ""}>
                <EditablePercentage
                    disabled={disabled_prob}
                    placeholder="Probability"
                    value={orig_probability}
                    conditional_on_blur={new_probability =>
                    {
                        crud.update_item({ ...VAP, probability: new_probability })
                    }}
                />
            </div>}

            {!is_boolean && orig_relative_probability !== undefined && <div className={disabled_rel_prob ? "disabled" : ""}>
                <EditableNumber
                    disabled={disabled_rel_prob}
                    placeholder="Relative probability"
                    size="medium"
                    value={is_boolean ? undefined : orig_relative_probability}
                    allow_undefined={true}
                    conditional_on_blur={new_relative_probability =>
                    {
                        new_relative_probability = is_boolean ? undefined : (new_relative_probability || 0)
                        crud.update_item({ ...VAP, relative_probability: new_relative_probability })
                    }}
                />
            </div>}

            &nbsp; <PredictionBadge
                disabled={true}
                size={20}
                probability={orig_probability}
                conviction={orig_conviction}
            />
        </div>
    </div>
}



const get_details = (VAPs_represent: VAPsType, editing: boolean) => (item: StateValueAndPrediction, crud: ListItemCRUDRequiredU<StateValueAndPrediction>): h.JSX.Element =>
{
    if (VAPs_represent === VAPsType.boolean) return <div>
        <div className="description_label">Description</div>
        Boolean value of this state, i.e. either true (100%), false (0%) or somewhere in between.
    </div>

    if (!editing && !item.description) return <div></div>

    return <div>
        <div className="description_label">Description</div>
        <EditableText
            placeholder="..."
            value={item.description}
            conditional_on_blur={description => crud.update_item({ ...item, description })}
        />
    </div>
}
