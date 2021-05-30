import type { Base, HasVersion } from "./base"
import type { TemporalUncertainty, PredictionBase } from "./uncertainty/uncertainty"
import type { WComponentNodeBase } from "./wcomponent_base"



export interface WComponentNodeState extends WComponentNodeBase
{
    // TODO remove once MVP reached (remove the conditionals)
    values?: StateValueString[]
}

export interface HasVAPSets
{
    values_and_prediction_sets: StateValueAndPredictionsSet[]
}

export interface WComponentNodeStateV2 extends WComponentNodeBase
{
    type: "statev2"
    subtype: WComponentStateV2SubType

    // boolean subtype specific explainable fields
    boolean_true_str?: string
    boolean_false_str?: string
}


export type WComponentStateV2SubType = "boolean" | "number" /*| "datetime"*/ | "other"
const _wcomponent_statev2_subtypes: {[P in WComponentStateV2SubType]: true} = {
    boolean: true,
    number: true,
    // datetime: true,
    other: true,
}
export const wcomponent_statev2_subtypes: WComponentStateV2SubType[] = Object.keys(_wcomponent_statev2_subtypes) as any



interface StateValueBase extends Base
{
    start_datetime: Date
    description: string
}


export interface StateValueString extends StateValueBase
{
    value: string
}



// This used to extend TemporalUncertainty but this _has a_ datetime with TemporalUncertainty
// it is _not_ that it _is an_ extension of TemporalUncertainty
//
// The values from Partial<PredictionBase> will be used as the default values for these fields
// in all the entries.
export interface StateValueAndPredictionsSet extends Base, HasVersion
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



export interface StateValueAndPrediction extends PredictionBase
{
    id: string
    value: string
    // The min and max refer to original author's assessment.  If we are recording a value reported by
    // author ABC then if ABC does not enter +/- values for a given probability then leave these values
    // blank.  If we disagree with, and or want to add our own +/- values then this should be a second
    // entry with the author_id set to me / us.
    min?: string
    max?: string
    author_id?: string
    description: string
    // This is not out of 100, it is the portion of the total probability that this
    // value has
    // Added this cause if you have 3 options of 0.3, 0.6 and 0.1 relative probability, and then
    // one of the options drops to 0, it's a lot easier to just keep the other values, rather than
    // force the user to update the others to sum to 1.0 -- there may be a smarter logic / UI / UX
    // solution to this but for now we can use this solution.
    relative_probability?: number
}


export interface VersionedStateVAPsSet
{
    latest: StateValueAndPredictionsSet
    older: StateValueAndPredictionsSet[]
}
