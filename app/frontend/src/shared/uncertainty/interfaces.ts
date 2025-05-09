import type { Base } from "../interfaces/base"



export interface PredictionBase
{
    explanation: string
    probability: number
    /**
     * `conviction` is referenced to as confidence in UI
     */
    conviction: number
}



// To update a previous TemporalUncertainty value, we could:
//  * set the ID to the same value
//  * or add fields for "previous_version" / "next_version"
export interface TemporalUncertainty extends Partial<PredictionBase>
{
    // The `future` field is a **demornalised** form of saying:
    // datetime.value > now and therefore is an indicator that the associated options, state, fact etc
    // are still open to change...
    // that there may be the opportunity for us to act to change the course of history before it happens.
    // One of the things it indicates / allows for is hope.
    // ~~We need it though as datetime.value is not always known, i.e. we think something will happen in the
    // future sometime but can not say when with any certainty.~~  -- actually we don't need it, we should
    // use min and set to now.
    //
    // 2021-04-12 13:00:  have commented out because it is a derived value and more importantly, it will
    // change according to the current created_at datetime value
    // future?: boolean

    // We could add a "potential" field
    // This "potential" field can be derived from the probability, i.e. if we think something has:
    //   1.  0% probability then we think there is "no" potential for it to happen
    //   2.  >0% then some potential
    //   3.  if its === 100% AND datetime.value > now then certainty this potential thing will occur.
    //
    // Note 1: it only represents the uncertainty of the actor assessing some state of the world.  It
    //         does not represent whether it is in the future or past (see caveat for example 3 when
    //         probability === 100%).
    // Note 2: there is a second use of this word "potential" which means that something we could do, a
    //         potential action.  Which has all the previous meaning, plus that of "future" which brings
    //         hope for us effecting some positive change.


    // datetime.value is optional to allow modelling situations where we want to say:
    //
    // an event or a state:
    //                                       |  future   |  value     |  probability
    //   will happen / will be true          |   true    |  undefined |  whatever X% (>= some threshold)
    //   could happen / could be true        |   true    |  undefined |  whatever X% ( < some threshold)
    //   has happened / is true              |   false   |  undefined |  whatever X% (>= some threshold)
    //   could have happened / could be true |   false   |  undefined |  whatever X% ( < some threshold)
    // but that we do not know when that will be / when it was.
    // In which cases we set the future to true or false as required.
    //
    // For cases where we want to model:
    //   will not happen                     |   true    |  undefined |  whatever Y% ((1-X)< some lower threshold)
    //   has not happened                    |   false   |  undefined |  whatever Y% ((1-X)< some lower threshold)
    // we can set the set probability to 0 and or conviction to 1.0 depending on situation
    //
    // For:
    //   will/not happen on N datetime       |   true    |  undefined |  whatever X%
    //   did/not happen on N datetime        |   false   |  undefined |  whatever X%
    // There is an implied min max which you can set if needed, without setting them it's likely it will
    // be assume to be a day resolution.  See https://github.com/centerofci/data-curator/issues/7
    //
    // For:
    //   will/not happen before N datetime   |   true    |  undefined |  whatever X%
    //   did/not happen before N datetime    |   false   |  undefined |  whatever X%
    // AND set the max to N date
    //
    // For:
    //   will/not happen after N datetime    |   true    |  undefined |  whatever X%
    //   did/not happen after N datetime     |   false   |  undefined |  whatever X%
    // AND set the min to N date
    //
    // For: "will not happen before K event" model and update manually (for now) using
    // "will not happen before N datetime" where N is the expected datetime of event K.
    //
    // TODO model dependencies that effect the earliest and latest a datetime can occur
    // TODO model process predictions that determine how long after or before a certain
    //      event this (start or end) datetime is expected to be.
    //
    value?: Date
    // min and max are to capture the uncertainty around the datetime value
    // To capture a start and end datetimes (as opposed to using min to represent start and
    // max to represent end), two instances of TemporalUncertainty should be deployed with
    // the object representing the end datetime through some other field(s), e.g. setting
    // probability (not on this datetime) from > 0 for start and for end to 0, or by having
    // a field stating its type, e.g. "start" | "stop".
    // Or instead of using the probability on this datetime and setting it to 0, which would
    // instead denote 0 probability of this datetime being true.
    min?: Date
    max?: Date
}

// export interface TemporalUncertaintyIncremental extends Partial<TemporalUncertainty>
// {
//     id: string
//     created_at: Date
// }



export interface HasUncertainDatetime
{
    // this could be called start_datetime but calling it just datetime for now as ~~I imagine
    // in the future we will have an even more advanced TemporalUncertainty interface to
    // cover situations like: "valid from X " ...~~
    //   ~~-- we can already record from and to using the min and max values... though this is
    //      overloading their other use as capturing uncertainty around the datetime.~~
    //     -- to signify a prediction of the end of something, just set the probability of the
    //        prediction itself to 0, **(not the prediction.datetime.probability)**
    datetime: TemporalUncertainty
}

export interface Prediction extends Base, PredictionBase, HasUncertainDatetime {}



// +++ 2021-04-10
// Justification for not having single predictions
//
// validity is a seperate concept to existence.  Something must first be valid before we care
// about it existing.  To use in one field we'd need to add a type label e.g.: {"predictions": PredictionWithType[]}
// where PredictionWithType extends Prediction { type: "validity" | "existence" }
// and then filter by "validity" first, take that value, if valid, then filter by existence
// and use that value from the existence type predictions entries for the truthiness
// probability of the item in question.
// Or as we have chosen so far to do, keep these two concepts seperate from each other
// --- 2021-04-10
// +++ 2024-04-05
// Removing existence predictions for now.  See commmit message for more details.
// --- 2024-04-05
