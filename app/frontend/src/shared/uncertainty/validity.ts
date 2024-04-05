import type { Prediction } from "./interfaces"



// Have called this `ExistencePredictions` before but changed because it's use is about
// "is this node valid".
// Example: The colour of the car used in the bank robbery
//    Initially this field has no entry, but it could be changed to have an entry with
//    probability of 0 if:
//        * the bank robbery was shown to not have even occured.
//        * the bank robbery did occur but a horse was used as the get away mode of transport.
// But it was also used for how true is this node, i.e. existence.  And it was renamed and removed without
// considering this alternative use case. e.g. for wc4.json it was capturing beliefs about
// how likely it was that person A could effect a change in organisation B.
//
// See "Justification for not having single predictions"
//
// Not making optional, interfaces extending this can use Partial<ValidityPredictions>
export interface ValidityPredictions
{
    // This used to be TemporalUncertainty but a prediction needs to have its own uncertainty
    // plus the datetime when it is active from **and the uncertainty around that datetime**
    validity: Prediction[]
}
