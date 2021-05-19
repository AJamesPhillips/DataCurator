import { get_new_VAP_id } from "../../shared/utils/ids"
import {
    ConnectionTerminalType,
    KnowledgeView,
    Perception,
    SpecialisedObjectsFromToServer,
    WComponent,
    WComponentNodeAction,
    WComponentNodeProcess,
    wcomponent_has_event_at,
    wcomponent_has_existence_predictions,
    wcomponent_has_validity_predictions,
    wcomponent_has_values,
    wcomponent_has_VAP_sets as wcomponent_has_VAP_sets,
    wcomponent_is_plain_connection,
    wcomponent_is_process,
} from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { StateValueAndPredictionsSet, StateValueString } from "../../shared/wcomponent/interfaces/state"
import type { Prediction, TemporalUncertainty } from "../../shared/wcomponent/interfaces/uncertainty"



export function parse_specialised_objects_from_server_data (data: SpecialisedObjectsFromToServer)
{
    const expected_specialised_object_keys = new Set([
        "perceptions",
        "wcomponents",
        "knowledge_views",
    ])

    const data_keys = Object.keys(data)

    const extra = data_keys.filter(k => !expected_specialised_object_keys.has(k as any))
    if (extra.length) throw new Error(`Unexpected keys "${extra.join(", ")}" in specialised objects state from server`)

    const missing = Array.from(expected_specialised_object_keys).filter(k => !data.hasOwnProperty(k))
    if (missing.length) throw new Error(`Expected keys "${missing.join(", ")}" missing in specialised objects state from server`)

    const perceptions: Perception[] = data.perceptions.map(parse_perception)
    const wcomponents: WComponent[] = data.wcomponents.map(parse_wcomponent)
    const knowledge_views: KnowledgeView[] = data.knowledge_views.map(parse_knowledge_view)

    const specialised_objects: SpecialisedObjectsFromToServer = {
        perceptions,
        wcomponents,
        knowledge_views,
    }

    return specialised_objects
}



const parse_perception = (perception: Perception) => parse_dates(perception)



function parse_wcomponent (wcomponent: WComponent): WComponent
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

    wcomponent = upgrade_2021_05_19_process_actions(wcomponent)
    wcomponent = upgrade_2021_05_19_existence_predictions(wcomponent)

    return wcomponent
}


// Upgrade valid as of 2021-05-19
function upgrade_2021_05_19_connection_fromto_types (type?: string): ConnectionTerminalType
{
    if (type === "meta-effector") return "meta"
    if (type === "meta-effected") return "meta"
    if (type === "effector") return "value"
    if (type === "effected") return "value"

    return (type || "value") as ConnectionTerminalType
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



const parse_prediction = (prediction: Prediction) => parse_dates(prediction)
const parse_values = (value: StateValueString) => parse_dates(value)
const parse_values_and_predictions_set = (VAP_set: StateValueAndPredictionsSet) => parse_dates(VAP_set)



function parse_knowledge_view (knowledge_view: KnowledgeView): KnowledgeView
{
    return {
        ...knowledge_view,
        created_at: new Date(knowledge_view.created_at),
    }
}



function parse_dates <T extends { created_at: Date, custom_created_at?: Date, datetime?: TemporalUncertainty }> (o: T): T
{
    return {
        ...o,
        created_at: new Date(o.created_at),
        custom_created_at: optional_date(o.custom_created_at),
        datetime: optional_datetime_temporal_uncertainty(o.datetime || {})
    }
}


const optional_date = (d: Date | undefined) => d === undefined ? undefined : new Date(d)


function optional_datetime_temporal_uncertainty (temporal_uncertainty?: TemporalUncertainty): TemporalUncertainty | undefined
{
    if (!temporal_uncertainty) return undefined

    return {
        ...temporal_uncertainty,
        value: optional_date(temporal_uncertainty.value),
        min: optional_date(temporal_uncertainty.min),
        max: optional_date(temporal_uncertainty.max),
    }
}
