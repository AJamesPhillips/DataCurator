import type { WComponentNodeStateV2Incremental } from "../state"


const d0 = new Date()
const d1 = new Date()


const possible_d3_dice_rolling: WComponentNodeStateV2Incremental = {
    id: "",
    created_at: d0,
    type: "statev2",
    subtype: "other",
    title: "Possible value of D3 roll: ${value}", // should render ${value} as "1 or 2 or 3" as all equally probable
    description: "A person fairly rolling a fair D3 dice",
    values_and_prediction_sets: [
        {
            id: "1",
            version: 1,
            created_at: d0,
            datetime: {}, // note it does not need a sim datetime value, just marked as future
            // though actually we do not even need to set this value?  What does it add?  This data of relative
            // probabilities is equally applicable before we know the outcome of a future _or past_ event.
            // This is were the "potential" field is applicable.

            entries: [
                { value: "1", relative_probability: 0.8 }, // made a mistake on purpose
                { value: "2", relative_probability: 1 },
                { value: "3", relative_probability: 1 },
            ],
            entry_defaults: {
                conviction: 1,
            },
        },
        {
            id: "2",
            version: 2,
            created_at: d0,
            entries: [
                { relative_probability: 1 }, // fix error
                {}, // nothing to change in previous entry
                {}, // nothing to change in previous entry
            ],
        },
    ],
}


const specific_dice_roll: WComponentNodeStateV2Incremental = {
    id: "",
    created_at: d1,
    type: "statev2",
    subtype: "other",
    title: "Possible value of D3 roll: ${value}", // should render ${value} as "1 or 2 or 3" as all equally probable
    description: "Person A rolled a D3 dice",
    values_and_prediction_sets: [
        {
            id: "1",
            version: 1,
            created_at: d0,
            datetime: {
                // future: true, // this future === true can be computed from the fact min > now
                min: d0,
                explanation: "We think Person A will roll the dice at some point in the future but we don't know when",
            },
            entry_defaults: {
                explanation: "see @@<possible_d3_dice_rolling.id>, probabilities copied from there",
                conviction: 1,
            },
            entries: [
                { value: "1", relative_probability: 1 },
                { value: "2", relative_probability: 1 },
                { value: "3", relative_probability: 1 },
            ],
        },
        // For now we can model it as below but in future it would be good to
        // instead have a +ve causal connection from the Person_A_rolled_a_2_on_a_d3_dice
        // event to the 2nd option, and -ve to the other options, such that when this node
        // was queried for its current value it summed its causal effects tne updated
        // the probabilities of its options to give similar data as below.
        {
            id: "2",
            version: 1,
            created_at: d1,
            datetime: { value: d1 },
            entry_defaults: {
                explanation: "@@<Person_A_rolled_a_2_on_a_d3_dice.id>",
            },
            entries: [
                { value: "1", relative_probability: 0 },
                { value: "2", relative_probability: 1 },
                { value: "3", relative_probability: 0 },
            ],
            previous_value_ids: ["2"],
        },
    ],
}
