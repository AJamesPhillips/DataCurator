import type { WComponentNodeStateV2, WComponentNodeState, StateValueAndPrediction } from "../state"
import type { WComponentConnection } from "../SpecialisedObjects"


// Dates set far in past / future to make it very clear this is not real.
const feb12th = new Date("2000-02-12")
const march1st = new Date("2000-03-01")
const april1st = new Date("2000-04-01")
const april20th = new Date("2000-04-20")
const april21st = new Date("2000-04-21")
const april28th = new Date("2000-04-28")


const default_VAP: StateValueAndPrediction = {
    id: "", value: "", description: "", explanation: "", probability: 1, conviction: 1,
}

// Claims
// Could make 4 state nodes:
// 1 to reference the other three and be "article in ABC on _x_ claiming Senator pressuring DPH to inflate tests"
// 1 to reference specific parts of article containing evidence against senator
// 1 to reference specific parts of article claiming DPH changed test counts
// 1 to reference specific parts of article drawing causal link between the two



const political_pressure_on_state_dph: WComponentNodeStateV2 = {
    id: "a",
    created_at: april20th,
    base_id: -1,
    type: "statev2",
    subtype: "boolean",
    title: "Political pressure ${value}",
    description: "@@Senator_ABC, facing re-election next month, put pressure on @@made-up-state_DPH to:\n * report higher tests than actuallly being conducted.",
    boolean_true_str: "existed",
    boolean_false_str: "did not exist",
    values_and_prediction_sets: [
        {
            id: "1",
            created_at: april20th,
            base_id: -1,
            datetime: {
                // future: false,
                value: feb12th,
            },
            entries: [
                {
                    ...default_VAP,
                    value: "true",
                    probability: 0.7,
                    conviction: 0.9,
                    description: "", // do not need a description for booleans because they have only one possible option
                    explanation: "Source (http://...) seems credible, reasoning sound, evidence of emails was strong but could still be forged."
                },
            ]
        },
        {
            id: "1",
            created_at: april21st,
            base_id: -1,
            datetime: {
                // future: false,
                value: feb12th,
            },
            entries: [
                {
                    ...default_VAP,
                    value: "true",
                    probability: 0.95,
                    conviction: 0.95,
                    explanation: "Senator has made a very blustered reponse, most interviewed in cross partisan poll revealed they thought he was lying http://..."
                },
            ]
        }
    ],
}


const state_dph_mis_reporting: WComponentNodeStateV2 = {
    id: "a",
    created_at: april20th,
    base_id: -1,
    type: "statev2",
    subtype: "boolean",
    title: "State DPH ${value} fradulently increase test count",
    description: "state DPH fradulently increased test count to be higher than actually being conducted.",
    boolean_true_str: "did",
    boolean_false_str: "did not",
    values_and_prediction_sets: [
        {
            id: "1",
            created_at: april20th,
            base_id: -1,
            datetime: {
                // future: false,
                value: feb12th,
                max: april1st,
            },
            entries: [
                {
                    ...default_VAP,
                    value: "true",
                    probability: 0.8,
                    conviction: 0.4,
                    explanation: "The claim (http://...) did not come with any supporting evidence that the numbers were actually changed."
                },
            ]
        },
        {
            id: "1",
            created_at: april28th,
            base_id: -1,
            datetime: {
                // future: false,
                value: feb12th,
                max: april1st,
            },
            entries: [
                {
                    ...default_VAP,
                    value: "true",
                    probability: 0.01,
                    conviction: 0.95,
                    explanation: "After the Senator spoke the head of DPH didn't comment on the senators remarks but did release the two 3rd party reports showing test results were not altered."
                },
            ]
        }
    ]
}


// Make 1 causal connection to contain the claim that:
// "political pressure resulted in made up state dph mis reporting"
// const political_pressure_resulting_in_made_up_state_dph_mis_reporting: WComponentConnection = {
//     id: "",
//     created_at:
//     base_id: -1,
//     type: "causal_link",
//
// }



const number_of_tests: WComponentNodeState = {
    id: "123",
    created_at: march1st,
    base_id: -1,
    type: "state",
    title: "Number of tests in region _a_",
    description: "",
    values: [
        {
            id: "",
            created_at: march1st,
            base_id: -1,
            start_datetime: march1st,
            description: "As reported by news outlet ABC here: http://...",
            value: "10",
        },
        {
            id: "",
            created_at: april1st,
            base_id: -1,
            // this will overwrite the other contrasting value for this time point.
            start_datetime: march1st,
            description: "Official figure from http://...",
            value: "30",
        },
        {
            id: "",
            created_at: april1st,
            base_id: -1,
            start_datetime: april1st,
            description: "Official figure from http://...",
            value: "50",
        },
    ]
}


// The question we're asking with this is: do we want continuous, like boolean, to only have one possible row of data?
// Two things:
//  1. it feels like it should be contained under one node, either through categories pointing to seperate nodes
//  2. or through categories containing all the competing values.
//  3. ultimately though we're going to make our assessment which might be using all of author A's data, before
//      moving to think all of author B's is correct
//      before finally moving to our own hybrid set of data composed from Author A and B and other events / hunches.
//      We might also have multiple different assessments from ourselves
//      And regardless will want to swap between different assessments to model what ifs.
// Ok so settled, for now continuous will only contain a single entry per datetime.value (ignoring the other
// fields for now).  And new values_and_predictions with the same datetime.value will be treated as updates of the
// previous value.
// ~~Later we can add previous/next version to explictly should updates vs competing values for~~
// Competing values should be contained in another seperate `statev2` `continuous` e.g. :
//    our assessment (high confidence)
//    our assessment (low confidence) (tighter min/max values)
const number_of_testsv2: WComponentNodeStateV2 = {
    id: "123",
    created_at: march1st,
    base_id: -1,
    type: "statev2",
    subtype: "number",
    title: "Number of tests in region _a_",
    description: "",
    values_and_prediction_sets: [
        {
            id: "1",
            created_at: march1st,
            base_id: -1,
            datetime: {
                // future: false,
                value: march1st,
            },
            entries: [
                {
                    ...default_VAP,
                    value: "10",
                    description: "As reported by news outlet ABC",
                    // Meta comment: this degree of explanation would only be used when it is a very important
                    // value to try to get right & therefore needs an indepth explaination as to why these
                    // values were arrived at.
                    explanation: "Link to original: http://..., might be missing some from north of the region.  Conviction is 100% because on average ABC gets it right (+/- 10%) about 70% of the time.",
                    probability: 0.7,
                    conviction: 1,
                },
            ],
        },
        {
            id: "1",
            created_at: april1st,
            base_id: -1,
            datetime: {
                // future: false,
                value: march1st,
            },
            entries: [
                {
                    ...default_VAP,
                    // description // will use value from above
                    explanation: "Lower probability as official numbers much higher and official numbers seem reasonable",
                    relative_probability: 0,
                    probability: 0, // auto calculated from relative_probability
                    conviction: 1,
                },
                {
                    ...default_VAP,
                    value: "30",
                    description: "Official figure from http://...",
                    explanation: "Official figures seem trustworthy",
                    relative_probability: 1,
                    probability: 1, // auto calculated from relative_probability
                    conviction: 1,
                },
            ],
        },
        {
            id: "2",
            created_at: april1st,
            base_id: -1,
            datetime: {
                // future: false,
                value: april1st,
            },
            entries: [
                { ...default_VAP, }, // copied entry from ABC news for April datetime
                {
                    ...default_VAP,
                    value: "50",
                    description: "Official figure from http://...",
                    explanation: "Official figures seem trustworthy",
                    probability: 0.8,
                    conviction: 1,
                },
            ],
        },
        {
            id: "1",
            created_at: april20th,
            base_id: -1,
            datetime: {
                // future: false,
                value: march1st,
            },
            entries: [
                {
                    ...default_VAP,
                    // Not updating probability because perhaps should leave as they are because
                    // no change to facts about ABC news for March datetime
                    // but then if an alternative is more probable that is closer to this value, then
                    // this value +/- 1 is more likely?
                    relative_probability: 0.3,
                },
                {
                    ...default_VAP,
                    explanation: "Official figures are challenged as being corrupt by 3rd party watch dog who claim they are much lower",
                    relative_probability: 0.2,
                    conviction: 0.8,
                },
                // Adding a new entry
                {
                    ...default_VAP,
                    value: "15",
                    description: "3rd party watch dog seperate from ABC news.",
                    explanation: "3rd party watch dog claims the official numbers are much lower, have released all their findings, much more robust estiamtes then ABC news: http://...",
                    relative_probability: 0.9,
                    probability: 0.6428571429, //
                    conviction: 0.8,
                },
            ],
        },
        {
            id: "2",
            created_at: april20th,
            base_id: -1,
            datetime: {
                // future: false,
                value: april1st,
            },
            entries: [
                { ...default_VAP }, // no entry from ABC news for April datetime
                {
                    ...default_VAP,
                    explanation: "Official figures are challenged as being corrupt by xyz who claim they are much lower",
                    probability: 0.2,
                    conviction: 0.8,
                },
                // Adding a new entry
                {
                    ...default_VAP,
                    value: "25",
                    explanation: "3rd party watch dog claims the official numbers are much lower, have released all their findings, much more robust estiamtes then ABC news: http://...",
                    probability: 0.9,
                    conviction: 0.8,
                },
            ],
        },
    ],
}
