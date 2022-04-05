import type { Base } from "../../shared/interfaces/base"
import type { TemporalUncertainty, PredictionBase } from "../../shared/uncertainty/interfaces"
import type { ValuePossibilitiesById } from "./possibility"
import type { WComponentNodeBase } from "./wcomponent_base"



export interface HasVAPSetsAndMaybeValuePossibilities
{
    value_possibilities?: ValuePossibilitiesById // optional as there will be older data that lacks this field
    values_and_prediction_sets: StateValueAndPredictionsSet[]

    // These are only used in the derived.composed_wcomponents_by_id
    _derived__using_value_from_wcomponent_id?: string | undefined
    _derived__applied_counterfactual_from_wcomponent_id?: string | undefined
}
export interface HasValuePossibilities
{
    value_possibilities: ValuePossibilitiesById
}


export type WComponentStateV2SubType = "boolean" | "number" /*| "datetime"*/ | "other"
export interface WComponentNodeStateV2 extends WComponentNodeBase
{
    type: "statev2"
    subtype: WComponentStateV2SubType | undefined

    // boolean subtype specific explainable fields
    // boolean_true_str?: string
    // boolean_false_str?: string
}


const _wcomponent_statev2_subtypes: {[P in WComponentStateV2SubType]: true} = {
    boolean: true,
    number: true,
    // datetime: true,
    other: true,
}
export const wcomponent_statev2_subtypes: WComponentStateV2SubType[] = Object.keys(_wcomponent_statev2_subtypes) as any


// Choosing not to name this `WComponentNodeStateValue` as whether it is represented by a node or not is irrelevant
export interface WComponentStateValue extends WComponentNodeBase
{
    type: "state_value"
    attribute_wcomponent_id: string | undefined
}



export function get_value_attributes (wcomponent: Partial<HasVAPSetsAndMaybeValuePossibilities>)
{
    return {
        value_possibilities: wcomponent.value_possibilities,
        values_and_prediction_sets: wcomponent.values_and_prediction_sets,
    }
}



export interface WComponentMultidimensionalState extends WComponentNodeBase
{
    type: "multidimensional_state"
}
export interface WComponentMultidimensionalStateData
{
    id: string
    schema_version: number
    author_id: string

    data_type: WComponentStateV2SubType
    schema_description: string
    schema: Schema
    dimension_data: {[dimension_name: string]: (string | number)[]}
    data: (string | number)[]
}
interface Schema
{
    dimensions: SchemaDimension[]
}
interface SchemaDimension
{
    name: string
    type: "string" | "number" | "boolean" | "date" | "datetime" | "space" //| "localised"
    // title can be deprecated later and replace with a localized type object called `title_loc`
    title: string
}



// This used to extend TemporalUncertainty but this _has a_ datetime with TemporalUncertainty
// it is _not_ that it _is an_ extension of TemporalUncertainty
//
// The values from Partial<PredictionBase> will be used as the default values for these fields
// in all the entries.
export interface StateValueAndPredictionsSet extends Base
{
    datetime: TemporalUncertainty
    entries: StateValueAndPrediction[]
    // Allows a set of values to have default values for them.
    // See dice_rolling.ts example for shared_entry_fields.explanation
    //
    // An example for shared_entry_fields.conviction, we might be applying for a grant and we have
    // 3 different possible values of: fail, success: 100k, success: 500k.  The probabilities
    // will change over time but at this time point the conviction for all three values will,
    // or will likely, be the same.
    shared_entry_values?: Partial<StateValueAndPrediction>

    // 2021-04-25 19:00
    // Not using this field yet as we will explore a simpler modeling approach, namely to use
    // the datetime in ascending order as the order to take the VAP sets in.
    // I think there will be scenarios which will need this data structure but for now we will ignore.
    // 2021-04-25 21:00
    // No this is needed for potential scenarios where a value could be A or B and where it does not
    // make sense to model this as exclusive option choices.  See two_time_dimensional_trees for
    // example(s).
    // 2021-05-08 see Issue #8
    previous_VAP_set_ids?: string[]
}


export interface StateValueCore
{
    value_id?: string // if present, will attempt to set `value` and `description` from ValuePossibilitiesById
    value: string
    // The min and max refer to original author's assessment.  If we are recording a value reported by
    // author ABC then if ABC does not enter +/- values for a given probability then leave these values
    // blank.  If we disagree with, and or want to add our own +/- values then this should be a second
    // entry with the author_id set to me / us.
    min?: string
    max?: string
    description?: string
}
export interface StateValueAndPrediction extends StateValueCore, PredictionBase
{
    id: string
    description: string
    author_id?: string
    // This is not out of 100, it is the portion of the total probability that this
    // value has
    // Added this cause if you have 3 options of 0.3, 0.6 and 0.1 relative probability, and then
    // one of the options drops to 0, it's a lot easier to just keep the other values, rather than
    // force the user to update the others to sum to 1.0 -- there may be a smarter logic / UI / UX
    // solution to this but for now we can use this solution.
    relative_probability?: number
}
