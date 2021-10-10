import { h } from "preact"

import "./common.css"
import { EditablePercentage } from "../../form/EditablePercentage"
import { EditableText } from "../../form/editable_text/EditableText"
import type {
    StateValueAndPredictionsSet as VAPSet,
    StateValueAndPrediction,
} from "../../wcomponent/interfaces/state"
import {
    get_probable_VAP_set_values,
    get_VAP_set_prob,
    get_VAP_set_conviction,
} from "../../wcomponent_derived/value_and_prediction/get_UI_value_of_VAP_set_attributes"
import { PredictionSummary } from "./to_deprecate/PredictionSummary"
import { UncertainDateTimeForm } from "../uncertain_datetime/UncertainDateTimeForm"
import { ValueAndPredictions } from "./ValueAndPredictions"
import { VAPsType } from "../../wcomponent/interfaces/value_probabilities_etc"
import { set_VAP_probabilities } from "../../wcomponent/CRUD_helpers/prepare_new_VAP"
import type { ListItemCRUD, ListItemCRUDRequiredU } from "../../form/editable_list/EditableListEntry"
import type { ValuePossibilitiesById } from "../../wcomponent/interfaces/possibility"



export const get_summary_for_single_VAP_set = (VAPs_represent: VAPsType, show_created_at: boolean) => (VAP_set: VAPSet, crud: ListItemCRUD<VAPSet>): h.JSX.Element =>
{
    let VAPs = get_VAPs_from_set(VAP_set, VAPs_represent)
    // leaving this for now in case we want to merge in and render v2 counterfactuals
    // VAPs = merge_counterfactuals_into_VAPs(VAPs)

    VAP_set = { ...VAP_set, entries: VAPs }

    const values = get_probable_VAP_set_values(VAP_set, VAPs_represent)
    const prob = get_VAP_set_prob(VAP_set, VAPs_represent) + "%"
    const conv = get_VAP_set_conviction(VAP_set, VAPs_represent) + "%"

    return <PredictionSummary
        created_at={show_created_at ? (VAP_set.custom_created_at || VAP_set.created_at) : undefined}
        value={values}
        datetime={VAP_set.datetime}
        probability={prob}
        conviction={conv}
    />
}



export const get_details_for_single_VAP_set = (value_possibilities: ValuePossibilitiesById | undefined, VAPs_represent: VAPsType) => (VAP_set: VAPSet, crud: ListItemCRUDRequiredU<VAPSet>): h.JSX.Element =>
{
    const VAPs = get_VAPs_from_set(VAP_set, VAPs_represent)

    return <div className="VAP_set_details">
        <br />
        <UncertainDateTimeForm
            datetime={VAP_set.datetime}
            on_change={datetime => crud.update_item({ ...VAP_set, datetime })}
        />

        {/* Experimented with hiding list of VAPs when VAP set represents a boolean as it would/should only ever contain one value */}
        {/* {VAPs_represent !== VAPsType.boolean && */}
        <div>
            <br />
            <ValueAndPredictions
                value_possibilities={value_possibilities}
                VAPs_represent={VAPs_represent}
                values_and_predictions={VAPs}
                update_values_and_predictions={VAPs =>
                {
                    const vanilla_entries = merge_entries(VAPs, VAP_set, VAPs_represent)
                    const entries_with_probabilities = set_VAP_probabilities(vanilla_entries, VAPs_represent)

                    const new_VAP_set = { ...VAP_set, entries: entries_with_probabilities }
                    crud.update_item(new_VAP_set)
                }}
            />
            <br />
        </div>
        {/* } */}

        <br />
    </div>
}



export const get_details2_for_single_VAP_set = (VAPs_represent: VAPsType, editing: boolean) => (VAP_set: VAPSet, crud: ListItemCRUDRequiredU<VAPSet>): h.JSX.Element =>
{
    const shared_entry_values = VAP_set.shared_entry_values || {}
    // Provide the explanations from exist VAPs
    const VAP_explanations = VAP_set.entries
        .map(({ explanation }) => explanation.trim())
        .filter(explanation => explanation)
        .join("\n\n")
    const explanation = shared_entry_values.explanation || VAP_explanations || ""
    const conviction = shared_entry_values.conviction || 1
    const VAPs_not_boolean = VAPs_represent !== VAPsType.boolean
    const display_explanation = !!(editing || explanation)

    return <div className="shared_VAP_set_details">
        {VAPs_not_boolean && <div>
            <EditablePercentage
                disabled={false}
                placeholder="Confidence"
                value={conviction}
                conditional_on_blur={conviction =>
                {
                    const shared_entry_values = { ...VAP_set.shared_entry_values, conviction }
                    // Overwrite all the existing convictions with this conviction
                    const entries = VAP_set.entries.map(e => ({ ...e, conviction }))
                    crud.update_item({ ...VAP_set, entries, shared_entry_values })
                }}
            />
        </div>}
        {display_explanation && <EditableText
            placeholder="Explanation"
            value={explanation}
            conditional_on_blur={explanation =>
            {
                const shared_entry_values = { ...VAP_set.shared_entry_values, explanation }
                crud.update_item({ ...VAP_set, shared_entry_values })
            }}
        />}

        <br />
    </div>
}



const get_created_at = (item: VAPSet) => item.created_at
const get_custom_created_at = (item: VAPSet) => item.custom_created_at



function get_VAPs_from_set (VAP_set: VAPSet, VAPs_represent: VAPsType)
{
    let VAPs = VAP_set.entries

    if (VAPs_represent === VAPsType.boolean && VAPs.length !== 1)
    {
        // ensure the ValueAndPrediction component always and only receives up to a single VAP entry
        VAPs = VAPs.slice(0, 1)
    }

    return VAPs
}



function merge_entries (VAPs: StateValueAndPrediction[], VAP_set: VAPSet, VAPs_represent: VAPsType)
{
    if (VAPs_represent === VAPsType.boolean)
    {
        // For now we'll save any other values that were already here from other subtypes
        VAPs = VAPs.concat(VAP_set.entries.slice(1))
    }

    return VAPs
}
