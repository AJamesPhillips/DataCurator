import { FunctionalComponent, h } from "preact"
import { useMemo } from "preact/hooks"
import type { Dispatch } from "redux"

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
import { wcomponent_is_counterfactual } from "../../shared/models/interfaces/SpecialisedObjects"
import type { WcIdCounterfactualsVAP_map } from "../../state/derived/State"



interface OwnProps
{
    wcomponent_id?: string
    VAP_set_id?: string
    created_at: Date
    subtype: WComponentStateV2SubType
    values_and_predictions: StateValueAndPrediction[]
    update_values_and_predictions: (values_and_predictions: StateValueAndPrediction[]) => void
}



const map_state = (state: RootState, props: OwnProps) => {
    const current_UI_knowledge_view = get_current_UI_knowledge_view_from_state(state)

    let allows_assumptions = false
    // let counterfactuals: (WComponentCounterfactual | undefined)[] = []
    let VAP_counterfactuals_map: WcIdCounterfactualsVAP_map | undefined = undefined

    const { wcomponent_id, VAP_set_id } = props
    if (current_UI_knowledge_view)
    {
        const { allows_assumptions: aa, wc_id_counterfactuals_map } = current_UI_knowledge_view
        allows_assumptions = !!aa

        const VAP_set_map = wcomponent_id ? wc_id_counterfactuals_map[wcomponent_id] : undefined
        VAP_counterfactuals_map = (VAP_set_map && VAP_set_id && VAP_set_map.VAP_set[VAP_set_id]) || undefined

        // if (VAP_map)
        // {
        //     counterfactuals = props.values_and_predictions.map(({ id }) =>
        //     {
        //         const counterfactual_wcomponent_id = VAP_map[id]
        //         if (!counterfactual_wcomponent_id) return undefined
        //         const counterfactual_wcomponent = state.specialised_objects.wcomponents_by_id[counterfactual_wcomponent_id]
        //         if (!counterfactual_wcomponent) return undefined
        //         if (!wcomponent_is_counterfactual(counterfactual_wcomponent)) return undefined
        //         return counterfactual_wcomponent
        //     })
        // }
    }


    return {
        allows_assumptions,
        VAP_counterfactuals_map,
    }
}



function map_dispatch (dispatch: Dispatch, own_props: OwnProps)
{
    interface UpsertCounterfactualArgs
    {
        id: string
        target_wcomponent_id: string
        target_VAP_set_id: string
        target_VAP_id: string
        probability?: number
        conviction?: number
    }

    return {
        upsert_counterfactual: (args: UpsertCounterfactualArgs) =>
        {
            // dispatch(ACTIONS.specialised_object.upsert_wcomponent({
            //     wcomponent: {
            //         type: "counterfactual"
            //     }
            // }))
        }
    }
}



const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _ValueAndPredictions (props: Props)
{
    const VAPs = props.values_and_predictions
    const class_name_only_one_VAP = (props.subtype === "boolean" && VAPs.length >= 1) ? "only_one_VAP" : ""

    const item_top_props = useMemo(() => {
        const props2: EditableListEntryTopProps<StateValueAndPrediction> = {
            get_created_at: () => props.created_at,
            get_summary: get_summary(props.subtype, props.allows_assumptions, props.VAP_counterfactuals_map),
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

export const ValueAndPredictions = connector(_ValueAndPredictions) as FunctionalComponent<OwnProps>



const get_id = (item: StateValueAndPrediction) => item.id


const get_summary = (subtype: WComponentStateV2SubType, allows_assumptions: boolean, VAP_counterfactuals_map: WcIdCounterfactualsVAP_map | undefined) => (item: StateValueAndPrediction, on_change: (item: StateValueAndPrediction) => void): h.JSX.Element =>
{
    const is_boolean = subtype === "boolean"
    const has_rel_prob = item.relative_probability !== undefined
    const disabled_prob = has_rel_prob && !is_boolean
    const disabled_rel_prob = !has_rel_prob || is_boolean

    const counterfactual = VAP_counterfactuals_map && VAP_counterfactuals_map[item.id]

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
                Cn: &nbsp; <EditablePercentage
                    placeholder="..."
                    value={item.conviction}
                    on_change={conviction => on_change({ ...item, conviction })}
                />
            </div>

            <PredictionBadge
                disabled={!allows_assumptions}
                size={20}
                probability={item.probability}
                conviction={item.conviction}
                counterfactual_probability={counterfactual && counterfactual.probability}
                counterfactual_conviction={counterfactual && counterfactual.conviction}
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
