import {
    KnowledgeView,
    Perception,
    SpecialisedObjectsFromToServer,
    WComponent,
    wcomponent_has_existence_predictions,
    wcomponent_has_validity_predictions,
    wcomponent_has_values,
    wcomponent_has_vaps as wcomponent_has_vap_sets,
} from "../../shared/models/interfaces/SpecialisedObjects"
import type { StateValueAndPredictionsSet, StateValueString } from "../../shared/models/interfaces/state"
import type { Prediction, TemporalUncertainty } from "../../shared/models/interfaces/uncertainty"



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

    if (wcomponent_has_vap_sets(wcomponent))
    {
        wcomponent.values_and_prediction_sets = wcomponent.values_and_prediction_sets && wcomponent.values_and_prediction_sets.map(parse_values_and_predictions_set)
    }

    return wcomponent
}



const parse_prediction = (prediction: Prediction) => parse_dates(prediction)
const parse_values = (value: StateValueString) => parse_dates(value)
const parse_values_and_predictions_set = (vap_set: StateValueAndPredictionsSet) => parse_dates(vap_set)



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
        datetime: optional_datetime_temporal_uncertainty(o.datetime)
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
