import type { Prediction } from "./uncertainty"



// This is used for how true is this node, i.e. existence.  And it was renamed and removed without
// considering this alternative use case. e.g. for wc4.json it was capturing beliefs about
// how likely it was that person A could effect a change in organisation B.
//
// See "Justification for not having single predictions" field below
//
// Not making optional, interfaces extending this can use Partial<ExistencePredictions>
//
// +++ 2021-04-15
// The existence prediction is the ?same? as the boolean state subtype?  Use this instead?
// --- 2021-04-15
// +++ 2021-05-04
// Perhaps this should only exist on non state components e.g. causal connections like wc4?
// --- 2021-05-04
// +++ 2021-05-19
// Existence is different from trueness, for example with wc4.json it is true that person A
// will have some ability to cause change in organisation B, i.e. that causality exists 100%.
// What the "existence prediction" was actually capturing was how likely it was that
// "person A could effect the change in organisation B that we were looking to achieve" was true.
// As such existence prediction should be renamed to truthiness or likelyness
//
// To argue the first point more fully that "it is true that person A will have some ability to
// cause change in organisation B, i.e. that causality exists 100%" ... person A is alive, as such
// any person who is alive has some ability to cause a change in organisation B.  If the person
// was dead then that causality would not exist, but then it might be more straightforward and
// sensible to say it is invalid, as use the validity prediction.
// --- 2021-05-19
export interface ExistencePredictions
{
    // This used to be TemporalUncertainty but a prediction needs to have its own uncertainty
    // plus the datetime when it is active from **and the uncertainty around that datetime**
    existence: Prediction[]
}
