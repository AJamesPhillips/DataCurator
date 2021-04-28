import { h } from "preact"

import "./common.css"
import { uncertain_date_to_string } from "../../form/datetime_utils"
import { EditableCustomDateTime } from "../../form/EditableCustomDateTime"
import type {
    WComponentStateV2SubType,
    StateValueAndPredictionsSet,
    StateValueAndPrediction,
} from "../../shared/models/interfaces/state"
import { get_probable_vap_set_values, get_vap_set_prob, get_vap_set_conviction } from "../../sharedf/wcomponent_state"
import { UncertainDateTime } from "../uncertainty/datetime"
import { prepare_new_vap, set_vap_probabilities } from "./utils"
import { ValueAndPredictions } from "./ValueAndPredictions"



export const get_summary_for_single_vap_set = (subtype: WComponentStateV2SubType, show_created_at: boolean) => (vap_set: StateValueAndPredictionsSet, on_change: (item: StateValueAndPredictionsSet) => void): h.JSX.Element =>
{
    vap_set = { ...vap_set, entries: get_vaps_from_set(vap_set, subtype) }

    const values = get_probable_vap_set_values(vap_set, subtype)
    const prob = get_vap_set_prob(vap_set, subtype)
    const conv = get_vap_set_conviction(vap_set, subtype)

    return <div>
        {show_created_at && <div style={{ display: "inline-flex" }}>
            Created: &nbsp;<EditableCustomDateTime
                invariant_value={vap_set.created_at}
                value={vap_set.custom_created_at}
            />
        </div>}
        <div className="vap_set_summary_container" style={{ display: "inline-flex", width: "100%" }}>
            <div>
                {uncertain_date_to_string(vap_set.datetime) || "-"}
            </div>
            {subtype !== "boolean" && <div>Value:&nbsp;{values}</div>}
            <div>Prob:&nbsp;{prob}&nbsp;%</div>
            <div>Cn:&nbsp;{conv}&nbsp;%</div>
        </div>
    </div>
}



export const get_details_for_single_vap_set = (subtype: WComponentStateV2SubType) => (vap_set: StateValueAndPredictionsSet, on_change: (item: StateValueAndPredictionsSet) => void): h.JSX.Element =>
{
    const entries = get_vaps_from_set(vap_set, subtype)

    return <div className="vap_set_details">
        <br />
        <UncertainDateTime
            datetime={vap_set.datetime}
            on_change={datetime => on_change({ ...vap_set, datetime })}
        />
        <br />
        <div>
            <ValueAndPredictions
                created_at={get_custom_created_at(vap_set) || get_created_at(vap_set)}
                subtype={subtype}
                values_and_predictions={entries}
                update_values_and_predictions={vaps => on_change(merge_entries(vaps, vap_set, subtype))}
            />
        </div>
        <br />
        <br />
    </div>
}


const get_created_at = (item: StateValueAndPredictionsSet) => item.created_at
const get_custom_created_at = (item: StateValueAndPredictionsSet) => item.custom_created_at



function get_vaps_from_set (vap_set: StateValueAndPredictionsSet, subtype: string)
{
    let vaps = vap_set.entries

    if (subtype === "boolean" && vaps.length !== 1)
    {
        // ensure the ValueAndPrediction component always and only receives a single vap entry
        const entries = vaps.length === 0 ? [prepare_new_vap()] : [vaps[0]]
        return entries
    }

    vaps = set_vap_probabilities(vap_set.entries)

    return vaps
}



function merge_entries (vaps: StateValueAndPrediction[], vap_set: StateValueAndPredictionsSet, subtype: string): StateValueAndPredictionsSet
{
    if (subtype === "boolean")
    {
        // For now we'll save any other values that were already here from other subtypes
        vaps = vaps.concat(vap_set.entries.slice(1))
    }

    return { ...vap_set, entries: vaps }
}

