import { h } from "preact"

import "./common.css"
import { uncertain_date_to_string } from "../../form/datetime_utils"
import { EditableCustomDateTime } from "../../form/EditableCustomDateTime"
import type {
    WComponentStateV2SubType,
    StateValueAndPredictionsSet,
    StateValueAndPrediction,
} from "../../shared/models/interfaces/state"
import { get_probable_VAP_set_values, get_VAP_set_prob, get_VAP_set_conviction } from "../../sharedf/wcomponent_state"
import { UncertainDateTime } from "../uncertainty/datetime"
import { set_VAP_probabilities } from "./utils"
import { ValueAndPredictions } from "./ValueAndPredictions"
import type { VAP_id_counterfactual_map, VAP_set_id_counterfactual_map } from "../../state/derived/State"
import { merge_counterfactuals_into_VAPs } from "../counterfactuals/merge"



export const get_summary_for_single_VAP_set = (subtype: WComponentStateV2SubType, show_created_at: boolean, VAP_counterfactuals_map: VAP_id_counterfactual_map | undefined) => (VAP_set: StateValueAndPredictionsSet, on_change: (item: StateValueAndPredictionsSet) => void): h.JSX.Element =>
{
    let VAPs = get_VAPs_from_set(VAP_set, subtype)
    console.log("VAP_counterfactuals_map...", VAP_counterfactuals_map)
    VAPs = merge_counterfactuals_into_VAPs(VAPs, VAP_counterfactuals_map)
    VAP_set = { ...VAP_set, entries: VAPs }

    const values = get_probable_VAP_set_values(VAP_set, subtype)
    const prob = get_VAP_set_prob(VAP_set, subtype)
    const conv = get_VAP_set_conviction(VAP_set, subtype)

    return <div>
        {show_created_at && <div style={{ display: "inline-flex" }}>
            Created: &nbsp;<EditableCustomDateTime
                invariant_value={VAP_set.created_at}
                value={VAP_set.custom_created_at}
            />
        </div>}
        <div className="VAP_set_summary_container" style={{ display: "inline-flex", width: "100%" }}>
            <div className="datetimes">
                {uncertain_date_to_string(VAP_set.datetime) || "-"}
            </div>
            {subtype !== "boolean" && <div>Value:&nbsp;{values}</div>}
            <div>Prob:&nbsp;{prob}&nbsp;%</div>
            <div>Cn:&nbsp;{conv}&nbsp;%</div>
        </div>
    </div>
}



export const get_details_for_single_VAP_set = (subtype: WComponentStateV2SubType, wcomponent_id?: string, VAP_set_counterfactuals_map?: VAP_set_id_counterfactual_map) => (VAP_set: StateValueAndPredictionsSet, on_change: (item: StateValueAndPredictionsSet) => void): h.JSX.Element =>
{
    const VAPs = get_VAPs_from_set(VAP_set, subtype)
    const VAP_counterfactuals_map = VAP_set_counterfactuals_map && VAP_set_counterfactuals_map[VAP_set.id]

    return <div className="VAP_set_details">
        <br />
        <UncertainDateTime
            datetime={VAP_set.datetime}
            on_change={datetime => on_change({ ...VAP_set, datetime })}
        />
        <br />
        <div>
            <ValueAndPredictions
                wcomponent_id={wcomponent_id}
                VAP_set_id={VAP_set.id}
                created_at={get_custom_created_at(VAP_set) || get_created_at(VAP_set)}
                subtype={subtype}
                values_and_predictions={VAPs}
                VAP_counterfactuals_map={VAP_counterfactuals_map}
                update_values_and_predictions={VAPs => on_change(merge_entries(VAPs, VAP_set, subtype))}
            />
        </div>
        <br />
        <br />
    </div>
}


const get_created_at = (item: StateValueAndPredictionsSet) => item.created_at
const get_custom_created_at = (item: StateValueAndPredictionsSet) => item.custom_created_at



function get_VAPs_from_set (VAP_set: StateValueAndPredictionsSet, subtype: string)
{
    let VAPs = VAP_set.entries

    if (subtype === "boolean" && VAPs.length !== 1)
    {
        // ensure the ValueAndPrediction component always and only receives up to a single VAP entry
        const entries = VAPs.slice(0, 1)
        return entries
    }

    VAPs = set_VAP_probabilities(VAP_set.entries)

    return VAPs
}



function merge_entries (VAPs: StateValueAndPrediction[], VAP_set: StateValueAndPredictionsSet, subtype: string): StateValueAndPredictionsSet
{
    if (subtype === "boolean")
    {
        // For now we'll save any other values that were already here from other subtypes
        VAPs = VAPs.concat(VAP_set.entries.slice(1))
    }

    return { ...VAP_set, entries: VAPs }
}
