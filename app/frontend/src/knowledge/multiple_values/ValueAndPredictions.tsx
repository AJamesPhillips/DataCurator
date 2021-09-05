import { FunctionalComponent, h } from "preact"

import "./ValueAndPredictions.css"
import { EditableNumber } from "../../form/EditableNumber"
import { EditablePercentage } from "../../form/EditablePercentage"
import { EditableText } from "../../form/editable_text/EditableText"
import { EditableTextSingleLine } from "../../form/editable_text/EditableTextSingleLine"
import type { EditableListEntryTopProps, ListItemCRUD } from "../../form/editable_list/EditableListEntry"
import { get_items_descriptor } from "../../form/editable_list/ExpandableList"
import { ListHeader } from "../../form/editable_list/ListHeader"
import { ListHeaderAddButton } from "../../form/editable_list/ListHeaderAddButton"
import { factory_render_list_content } from "../../form/editable_list/render_list_content"
import type { StateValueAndPrediction } from "../../shared/wcomponent/interfaces/state"
import { prepare_new_VAP } from "./utils"
import { PredictionBadge } from "../predictions/PredictionBadge"
import { connect, ConnectedProps } from "react-redux"
import type { RootState } from "../../state/State"
import { get_current_composed_knowledge_view_from_state } from "../../state/specialised_objects/accessors"
import { ACTIONS } from "../../state/actions"
import type { VAP_id_counterfactual_map } from "../../shared/uncertainty/uncertainty"
import { is_counterfactual_active } from "../../shared/counterfactuals/active"
import { merge_counterfactual_into_VAP } from "../../shared/counterfactuals/merge"
import { get_new_wcomponent_object } from "../../shared/wcomponent/get_new_wcomponent_object"
import type { CreationContextState } from "../../shared/creation_context/state"
import { VAPsType } from "../../shared/wcomponent/interfaces/generic_value"
import type { WComponentCounterfactual } from "../../shared/wcomponent/interfaces/counterfactual"



interface OwnProps
{
    wcomponent_id?: string
    VAP_set_id?: string
    created_at: Date
    VAPs_represent: VAPsType
    values_and_predictions: StateValueAndPrediction[]
    VAP_counterfactuals_map?: VAP_id_counterfactual_map
    update_values_and_predictions: (values_and_predictions: StateValueAndPrediction[]) => void
}



const map_state = (state: RootState) => {
    const current_composed_knowledge_view = get_current_composed_knowledge_view_from_state(state)

    return {
        knowledge_view_id: current_composed_knowledge_view && current_composed_knowledge_view.id,
        creation_context: state.creation_context,
        editing: !state.display_options.consumption_formatting,
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
    const { creation_context, editing, VAPs_represent } = props

    const VAPs = props.values_and_predictions
    const class_name_only_one_VAP = (VAPs_represent === VAPsType.boolean && VAPs.length >= 1) ? "only_one_VAP" : ""

    const item_top_props: EditableListEntryTopProps<StateValueAndPrediction> = {
        // Do not show created_at of VAPs when in VAP set
        // get_created_at: () => props.created_at,
        get_summary: get_summary({
            VAPs_represent,
            VAP_counterfactuals_map: props.VAP_counterfactuals_map,
            upsert_counterfactual: props.upsert_counterfactual,
            knowledge_view_id: props.knowledge_view_id,
            wcomponent_id: props.wcomponent_id,
            VAP_set_id: props.VAP_set_id,
            creation_context,
            editing,
        }),
        get_details: get_details(VAPs_represent, editing),
        extra_class_names: "value_and_prediction",
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
            item_top_props,
            delete_button_text: "Delete Value & Prediction",
            debug_item_descriptor: item_descriptor,
            update_items: props.update_values_and_predictions,
        })({ expanded_item_rows: true, expanded_items: true, disable_partial_collapsed: false })}
    </div>
}

export const ValueAndPredictions = connector(_ValueAndPredictions) as FunctionalComponent<OwnProps>



const get_id = (item: StateValueAndPrediction) => item.id



interface GetSummaryArgs
{
    VAPs_represent: VAPsType
    VAP_counterfactuals_map: VAP_id_counterfactual_map | undefined
    knowledge_view_id: string | undefined
    wcomponent_id: string | undefined
    VAP_set_id: string | undefined
    upsert_counterfactual: (counterfactual: WComponentCounterfactual, knowledge_view_id: string) => void
    creation_context: CreationContextState
    editing: boolean
}
const get_summary = (args: GetSummaryArgs) => (VAP: StateValueAndPrediction, crud: ListItemCRUD<StateValueAndPrediction>): h.JSX.Element =>
{
    const { VAPs_represent, VAP_counterfactuals_map, knowledge_view_id,
        wcomponent_id, VAP_set_id, upsert_counterfactual, creation_context, editing } = args

    const counterfactual = VAP_counterfactuals_map && VAP_counterfactuals_map[VAP.id]
    const counterfactual_active = is_counterfactual_active(counterfactual)
    const { probability, conviction } = merge_counterfactual_into_VAP(VAP, counterfactual)

    const is_boolean = VAPs_represent === VAPsType.boolean
    const is_number = VAPs_represent === VAPsType.number

    const has_rel_prob = VAP.relative_probability !== undefined
    const disabled_prob = has_rel_prob && !is_boolean || counterfactual_active
    const disabled_rel_prob = !has_rel_prob || is_boolean
    const disabled_conviction = counterfactual_active

    const disabled_setting_counterfactual = !editing || !knowledge_view_id || !wcomponent_id || !VAP_set_id

    return <div className="value_and_prediction_summary">
        <div className="temporal_uncertainty">
            {is_number && (editing || VAP.min) && <div>
                <div className="description_label">min</div> &nbsp; <EditableTextSingleLine
                    placeholder="..."
                    value={VAP.min || ""}
                    conditional_on_blur={min => crud.update_item({ ...VAP, min })}
                />
            </div>}
            {(editing || VAP.value) && <div>
                <div className="description_label">value</div> &nbsp; <EditableTextSingleLine
                    disabled={is_boolean}
                    placeholder="..."
                    value={is_boolean ? "True" : VAP.value}
                    conditional_on_blur={value => crud.update_item({ ...VAP, value })}
                />
            </div>}
            {is_number && (editing || VAP.max) && <div>
                <div className="description_label">max</div> &nbsp; <EditableTextSingleLine
                    placeholder="..."
                    value={VAP.max || ""}
                    conditional_on_blur={max => crud.update_item({ ...VAP, max })}
                />
            </div>}
        </div>
        <div className="probabilities">
            {is_boolean && <div className={disabled_prob ? "disabled" : ""}>
                <div className="description_label">Prob</div> &nbsp; <EditablePercentage
                    disabled={disabled_prob}
                    placeholder="..."
                    value={probability}
                    conditional_on_blur={probability => crud.update_item({ ...VAP, probability })}
                />
            </div>}
            {!is_boolean && VAP.relative_probability !== undefined && <div className={disabled_rel_prob ? "disabled" : ""}>
                <div className="description_label">Rel prob</div> &nbsp; <EditableNumber
                    disabled={disabled_rel_prob}
                    placeholder="..."
                    value={is_boolean ? undefined : VAP.relative_probability}
                    allow_undefined={true}
                    conditional_on_blur={relative_probability => crud.update_item({ ...VAP, relative_probability })}
                />
            </div>}
            {is_boolean && <div className={disabled_conviction ? "disabled" : ""}>
                <div className="description_label">Cn</div> &nbsp; <EditablePercentage
                    disabled={disabled_conviction}
                    placeholder="..."
                    value={conviction}
                    conditional_on_blur={conviction => crud.update_item({ ...VAP, conviction })}
                />
            </div>}

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
                    }, creation_context) as WComponentCounterfactual)

                    cf = { ...cf, ...args }
                    upsert_counterfactual(cf, knowledge_view_id)
                }}
            />
        </div>
    </div>
}


const get_details = (VAPs_represent: VAPsType, editing: boolean) => (item: StateValueAndPrediction, crud: ListItemCRUD<StateValueAndPrediction>): h.JSX.Element =>
{
    if (VAPs_represent === VAPsType.boolean) return <div></div>

    if (!editing && !item.description) return <div></div>

    return <div>
        <div className="description_label">Description:</div>
        <EditableText
            placeholder="..."
            value={item.description}
            conditional_on_blur={description => crud.update_item({ ...item, description })}
        />
    </div>
}
