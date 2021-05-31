import { get_new_VAP_id } from "../../utils/ids"
import {
    WComponent,
    wcomponent_has_validity_predictions,
    wcomponent_has_existence_predictions,
    wcomponent_has_values,
    wcomponent_has_VAP_sets,
    wcomponent_has_event_at,
    wcomponent_is_plain_connection,
    wcomponent_has_started_stopped_at,
    ConnectionTerminalAttributeType,
    wcomponent_is_process,
    wcomponent_is_action,
} from "../interfaces/SpecialisedObjects"
import type { StateValueAndPredictionsSet, StateValueString } from "../interfaces/state"
import type { Prediction } from "../interfaces/uncertainty/uncertainty"
import { parse_dates, optional_date } from "./parse_dates"



export function parse_wcomponent (wcomponent: WComponent): WComponent
{
    wcomponent = {
        ...parse_dates(wcomponent),
    }

    if (wcomponent_has_validity_predictions(wcomponent))
    {
        wcomponent.validity = wcomponent.validity.map(parse_prediction)
    }

    if (wcomponent_has_existence_predictions(wcomponent))
    {
        wcomponent.existence = wcomponent.existence.map(parse_prediction)
    }

    if (wcomponent_has_values(wcomponent))
    {
        wcomponent.values = wcomponent.values && wcomponent.values.map(parse_values)
    }

    if (wcomponent_has_VAP_sets(wcomponent))
    {
        wcomponent.values_and_prediction_sets = wcomponent.values_and_prediction_sets && wcomponent.values_and_prediction_sets.map(parse_values_and_predictions_set)
    }

    if (wcomponent_has_event_at(wcomponent))
    {
        wcomponent.event_at = wcomponent.event_at.map(parse_dates)
    }

    if (wcomponent_is_plain_connection(wcomponent))
    {
        wcomponent.from_type = upgrade_2021_05_19_connection_fromto_types(wcomponent.from_type)
        wcomponent.to_type = upgrade_2021_05_19_connection_fromto_types(wcomponent.to_type)
    }

    if (wcomponent_has_started_stopped_at(wcomponent))
    {
        wcomponent.started_at = optional_date(wcomponent.started_at)
        wcomponent.stopped_at = optional_date(wcomponent.stopped_at)
    }

    wcomponent = upgrade_2021_05_19_process_actions(wcomponent)
    wcomponent = upgrade_2021_05_19_existence_predictions(wcomponent)
    wcomponent = upgrade_2021_05_24_action(wcomponent)

    return wcomponent
}


// Upgrade valid as of 2021-05-19
function upgrade_2021_05_19_connection_fromto_types (type?: string): ConnectionTerminalAttributeType
{
    if (type === "meta-effector") return "meta"
    if (type === "meta-effected") return "meta"
    if (type === "effector") return "value"
    if (type === "effected") return "value"

    return (type || "value") as ConnectionTerminalAttributeType
}


// Upgrade valid as of 2021-05-19
function upgrade_2021_05_19_process_actions (wcomponent: WComponent)
{
    if (!wcomponent_is_process(wcomponent) || !(wcomponent as any).is_action) return wcomponent

    const wcomponent_action = {
        ...wcomponent,
        is_action: undefined,
        type: "action"
    }

    return wcomponent_action as WComponent
}


// Upgrade valid as of 2021-05-19
function upgrade_2021_05_19_existence_predictions (wcomponent: WComponent)
{
    if (!wcomponent_has_existence_predictions(wcomponent)) return wcomponent
    if (wcomponent_has_VAP_sets(wcomponent)) return wcomponent

    const values_and_prediction_sets: StateValueAndPredictionsSet[] = wcomponent.existence.map(e =>
    {
        return {
            id: e.id.replace("pr", "vps"),
            created_at: e.created_at,
            custom_created_at: e.custom_created_at,
            datetime: e.datetime || {},
            entries: [
                {
                    id: get_new_VAP_id(),
                    value: "",
                    description: "",
                    explanation: e.explanation,
                    probability: e.probability,
                    conviction: e.conviction,
                }
            ],
            version: 1,
        }
    })

    const upgraded_wcomponent = {
        ...wcomponent,
        existence: undefined,
        values_and_prediction_sets,
    }

    return upgraded_wcomponent as WComponent
}


function upgrade_2021_05_24_action (wcomponent: WComponent): WComponent
{
    if (wcomponent_is_action(wcomponent))
    {
        const depends_on_action_ids = wcomponent.depends_on_action_ids || []
        wcomponent = { ...wcomponent, depends_on_action_ids }
    }

    return wcomponent
}



const parse_prediction = (prediction: Prediction) => parse_dates(prediction)
const parse_values = (value: StateValueString) => parse_dates(value)
const parse_values_and_predictions_set = (VAP_set: StateValueAndPredictionsSet) => parse_dates(VAP_set)
