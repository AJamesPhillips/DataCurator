import type { Base } from "./base"
import type { TemporalUncertainty, PredictionBase } from "./uncertainty"
import type { WComponentNodeBase } from "./wcomponent"



export interface WComponentNodeState extends WComponentNodeBase
{
    // TODO remove once MVP reached (remove the conditionals)
    values?: StateValueString[]
}
export interface WComponentNodeStateV2 extends WComponentNodeStateV2Incremental
{
    values_and_prediction_sets: StateValueAndPredictionsSet[]
}
export interface WComponentNodeStateV2Incremental extends WComponentNodeBase
{
    type: "statev2"
    subtype: WComponentStateV2SubType

    // boolean subtype specific explainable fields
    boolean_true_str?: string
    boolean_false_str?: string

    values_and_prediction_sets: StateValueAndPredictionsSetIncremental[]
}


export type WComponentStateV2SubType = "boolean" | "number" | "datetime" | "other"
const _wcomponent_statev2_subtypes: {[P in WComponentStateV2SubType]: true} = {
    boolean: true,
    number: true,
    datetime: true,
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
    value: string | null
}



// This used to extend TemporalUncertainty but this _has a_ datetime with TemporalUncertainty
// it is _not_ that it _is an_ extension of TemporalUncertainty
//
// The values from Partial<PredictionBase> will be used as the default values for these fields
// in all the entries.
export interface StateValueAndPredictionsSet extends StateValueAndPredictionsSetIncremental
{
    datetime: TemporalUncertainty
    entries: StateValueAndPrediction[]
}

interface StateValueAndPredictionsSetIncremental extends Base
{
    version: number

    datetime?: TemporalUncertainty
    // If an array is provided in an incremental then it must be of the same length as "previous"
    // arrays and be populated with empty objects otherwise, or if null the corresponing values
    // missing will be dropped
    entries?: (Partial<StateValueAndPrediction> | null)[]
    // Allows a set of values to have default values for them.
    // See dice_rolling.ts example for entry_defaults.explanation
    //
    // An example for entry_defaults.conviction, we might be applying for a grant and we have
    // 3 different possible values of: fail, success: 100k, success: 500k.  The probabilities
    // will change over time but at this time point the conviction for all three values will,
    // or will likely, be the same.
    entry_defaults?: Partial<StateValueAndPrediction>

    previous_value_ids?: string[]
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
