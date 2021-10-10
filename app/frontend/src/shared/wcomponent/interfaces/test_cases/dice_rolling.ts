import type { WComponentNodeEvent } from "../event"
import type { StateValueAndPrediction, WComponentNodeStateV2 } from "../state"



function dice_rolling__test_case ()
{

    const d0 = new Date()
    const d1 = new Date()


    const default_VAP: StateValueAndPrediction = {
        id: "", value: "", description: "", explanation: "", probability: 1, conviction: 1,
    }

    const possible_d3_dice_rolling: WComponentNodeStateV2 = {
        id: "",
        created_at: d0,
        base_id: -1,
        type: "statev2",
        subtype: "other",
        title: "Possible value of D3 roll: ${value}", // should render ${value} as "1 or 2 or 3" as all equally probable
        description: "A person fairly rolling a fair D3 dice",
        values_and_prediction_sets: [
            {
                id: "1",
                created_at: d0,
                base_id: -1,
                datetime: {}, // note it does not need a sim datetime value, just marked as future
                // though actually we do not even need to set this value?  What does it add?  This data of relative
                // probabilities is equally applicable before we know the outcome of a future _or past_ event.
                // This is were the "potential" field is applicable.

                entries: [
                    { ...default_VAP, value: "1", relative_probability: 0.8 }, // made a mistake on purpose
                    { ...default_VAP, value: "2", relative_probability: 1 },
                    { ...default_VAP, value: "3", relative_probability: 1 },
                ],
                shared_entry_values: {
                    conviction: 1,
                },
            },
            {
                id: "2",
                created_at: d1,
                base_id: -1,
                datetime: {},
                entries: [
                    { ...default_VAP, relative_probability: 1 }, // fix error
                    { ...default_VAP }, // nothing to change in previous entry
                    { ...default_VAP }, // nothing to change in previous entry
                ],
            },
        ],
    }




    const Person_A_rolled_a_2_on_a_d3_dice: WComponentNodeEvent = {
        id: "890",
        created_at: d1,
        base_id: -1,
        type: "event",
        title: "Person A rolled a 2 on a d3 dice",
        description: "",
    }

    const specific_dice_roll: WComponentNodeStateV2 = {
        id: "",
        created_at: d0,
        base_id: -1,
        type: "statev2",
        subtype: "other",
        title: "Possible value of D3 roll: ${value}", // should render ${value} as "1 or 2 or 3" as all equally probable
        description: "Person A rolled a D3 dice",
        values_and_prediction_sets: [
            {
                id: "1",
                created_at: d0,
                base_id: -1,
                datetime: {
                    // future: true, // this future === true can be computed from the fact min > now
                    min: d0,
                    explanation: "We think Person A will roll the dice at some point in the future but we don't know when",
                },
                shared_entry_values: {
                    explanation: `see @@${possible_d3_dice_rolling.id}, probabilities copied from there`,
                    conviction: 1,
                },
                entries: [
                    { ...default_VAP, value: "1", relative_probability: 1 },
                    { ...default_VAP, value: "2", relative_probability: 1 },
                    { ...default_VAP, value: "3", relative_probability: 1 },
                ],
            },
            // For now we can model it as below but in future it would be good to
            // instead have a +ve causal connection from the Person_A_rolled_a_2_on_a_d3_dice
            // event to the 2nd option, and -ve to the other options, such that when this node
            // was queried for its current value it summed its causal effects tne updated
            // the probabilities of its options to give similar data as below.
            {
                id: "2",
                created_at: d1,
                base_id: -1,
                datetime: { value: d1 },
                shared_entry_values: {
                    explanation: `@@${Person_A_rolled_a_2_on_a_d3_dice.id}`,
                },
                entries: [
                    { ...default_VAP, value: "1", relative_probability: 0 },
                    { ...default_VAP, value: "2", relative_probability: 1 },
                    { ...default_VAP, value: "3", relative_probability: 0 },
                ],
                // previous_VAP_set_ids should not be needed as we default to taking the latest
                // VAP set
                // previous_VAP_set_ids: ["1"],
            },
        ],
    }
}
