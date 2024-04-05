import {
    clean_base_object_of_sync_meta_fields,
} from "../../state/sync/supabase/clean_base_object_for_supabase"
import type { Prediction } from "../../shared/uncertainty/interfaces"
import {
    WComponent,
    wcomponent_has_validity_predictions,
    wcomponent_has_VAP_sets,
    wcomponent_has_event_at,
    wcomponent_is_plain_connection,
    ConnectionTerminalAttributeType,
    wcomponent_is_process,
    wcomponent_is_action,
    wcomponent_is_goal,
} from "../interfaces/SpecialisedObjects"
import type { StateValueAndPredictionsSet } from "../interfaces/state"
import { parse_base_dates } from "./parse_dates"



export function parse_wcomponent (wcomponent: WComponent): WComponent
{
    wcomponent = clean_base_object_of_sync_meta_fields(wcomponent) // defensive

    wcomponent = upgrade_2021_05_19_process_actions(wcomponent)
    wcomponent = upgrade_2021_05_24_action(wcomponent)
    wcomponent = upgrade_2021_06_12_goal(wcomponent)

    wcomponent = {
        ...parse_base_dates(wcomponent),
    }

    if (wcomponent_has_validity_predictions(wcomponent))
    {
        wcomponent.validity = wcomponent.validity.map(parse_prediction)
    }

    if (wcomponent_has_VAP_sets(wcomponent))
    {
        const VAP_sets = wcomponent.values_and_prediction_sets
        wcomponent.values_and_prediction_sets = VAP_sets && VAP_sets.map(parse_values_and_predictions_set)
    }

    if (wcomponent_has_event_at(wcomponent))
    {
        wcomponent.event_at = wcomponent.event_at.map(parse_base_dates)
    }

    if (wcomponent_is_plain_connection(wcomponent))
    {
        wcomponent.from_type = upgrade_2021_05_19_connection_fromto_types(wcomponent.from_type)
        wcomponent.to_type = upgrade_2021_05_19_connection_fromto_types(wcomponent.to_type)

        wcomponent.from_type = upgrade_2021_05_31_connection_fromto_types(wcomponent.from_type)
        wcomponent.to_type = upgrade_2021_05_31_connection_fromto_types(wcomponent.to_type)
    }

    return wcomponent
}



// Upgrade valid as of 2021-05-19
function upgrade_2021_05_19_connection_fromto_types (type?: string): ConnectionTerminalAttributeType
{
    if (type === "meta-effector") return "meta"
    if (type === "meta-effected") return "meta"
    if (type === "effector") return "state"
    if (type === "effected") return "state"

    return (type || "state") as ConnectionTerminalAttributeType
}


// Upgrade valid as of 2021-05-31
function upgrade_2021_05_31_connection_fromto_types (type?: string): ConnectionTerminalAttributeType
{
    if (type === "value") return "state"

    return (type || "state") as ConnectionTerminalAttributeType
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



function upgrade_2021_05_24_action (wcomponent: WComponent): WComponent
{
    if (wcomponent_is_action(wcomponent))
    {
        const depends_on_action_ids = wcomponent.depends_on_action_ids || []
        wcomponent = { ...wcomponent, depends_on_action_ids }
    }

    return wcomponent
}



function upgrade_2021_06_12_goal (wcomponent: WComponent): WComponent
{
    if (wcomponent_is_goal(wcomponent))
    {
        const objective_ids = wcomponent.objective_ids || []
        wcomponent = { ...wcomponent, objective_ids }
    }

    return wcomponent
}



const parse_prediction = (prediction: Prediction) => parse_base_dates(prediction)
const parse_values_and_predictions_set = (VAP_set: StateValueAndPredictionsSet) => parse_base_dates(VAP_set)
