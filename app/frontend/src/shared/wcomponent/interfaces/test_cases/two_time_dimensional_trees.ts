import type { WComponentNodeStateV2 } from "../state"




const day1 = new Date("2021-04-21")
const day2 = new Date("2021-04-22")
const day3 = new Date("2021-04-23")
const day4 = new Date("2021-04-24")
const day5 = new Date("2021-04-25")


const two_time_dimensional_trees: WComponentNodeStateV2 = {
    id: "node1_id",
    created_at: day1,
    base_id: -1,
    type: "statev2",
    subtype: "other",
    title: "",
    description: "",
    values_and_prediction_sets: [
        // On day 1 you think it is A
        //      and you think it will be B on day 2
        {
            id: "VAP_set_id1",
            created_at: day1,
            base_id: -1,
            datetime: { value: day1 },
            entries: [{
                id: "",
                value: "A",
                description: "",
                explanation: "",
                probability: 1,
                conviction: 1,
            }],
        },
        {
            id: "VAP_set_id2",
            created_at: day1,
            base_id: -1,
            datetime: { value: day2 },
            entries: [{
                id: "",
                value: "B",
                description: "",
                explanation: "",
                probability: 1,
                conviction: 1,
            }],
            previous_VAP_set_ids: ["VAP_set_id1"],
        },
        // On day 2 you realise (revise) its value from A to C
        //      and you set its new value on day 2 to be D
        {
            id: "VAP_set_id1",
            created_at: day2,
            base_id: -1,
            datetime: { value: day1 },
            entries: [{
                id: "",
                value: "C",
                description: "",
                explanation: "",
                probability: 1,
                conviction: 1,
            }],
        },
        {
            id: "VAP_set_id2",
            created_at: day2,
            base_id: -1,
            datetime: { value: day2 },
            entries: [{
                id: "",
                value: "D",
                description: "",
                explanation: "",
                probability: 1,
                conviction: 1,
            }],
            previous_VAP_set_ids: ["VAP_set_id1"],
        },
        // On day 3 you think its value on day 4 will be E or F OR G or H
        //      and you think its value on day 5 will be I
        {
            id: "VAP_set_id3",
            created_at: day3,
            base_id: -1,
            datetime: { value: day4 },
            entries: [{
                id: "",
                value: "E",
                description: "",
                explanation: "",
                probability: 0.5,
                conviction: 1,
            },
            {
                id: "",
                value: "F",
                description: "",
                explanation: "",
                probability: 0.5,
                conviction: 1,
            }],
            previous_VAP_set_ids: ["VAP_set_id2"],
        },
        {
            id: "VAP_set_id4",
            created_at: day3,
            base_id: -1,
            datetime: { value: day4 },
            entries: [{
                id: "",
                value: "G",
                description: "",
                explanation: "",
                probability: 0.5,
                conviction: 1,
            },
            {
                id: "",
                value: "5",
                description: "",
                explanation: "",
                probability: 0.5,
                conviction: 1,
            }],
            previous_VAP_set_ids: ["VAP_set_id2"],
        },
        {
            id: "VAP_set_id5",
            created_at: day3,
            base_id: -1,
            datetime: { value: day5 },
            entries: [{
                id: "",
                value: "I",
                description: "",
                explanation: "",
                probability: 1,
                conviction: 1,
            }],
            previous_VAP_set_ids: ["VAP_set_id3", "VAP_set_id4"],
        },
        // On day 4 you find its value was E and update both the entries for 'E or F' and 'G or H'
        //      and you revise your prediction for I to become J
        {
            id: "VAP_set_id3",
            created_at: day4,
            base_id: -1,
            datetime: { value: day4 },
            entries: [{
                id: "",
                value: "E",
                description: "",
                explanation: "",
                probability: 1,
                conviction: 1,
            },
            {
                id: "",
                value: "F",
                description: "",
                explanation: "",
                probability: 0,
                conviction: 1,
            }],
            previous_VAP_set_ids: ["VAP_set_id2"],
        },
        {
            id: "VAP_set_id4",
            created_at: day4,
            base_id: -1,
            datetime: { value: day4 },
            entries: [{
                id: "",
                value: "G",
                description: "",
                explanation: "",
                probability: 0,
                conviction: 1,
            },
            {
                id: "",
                value: "5",
                description: "",
                explanation: "",
                probability: 0,
                conviction: 1,
            }],
            previous_VAP_set_ids: ["VAP_set_id2"],
        },
        {
            id: "VAP_set_id5",
            created_at: day4,
            base_id: -1,
            datetime: { value: day5 },
            entries: [{
                id: "",
                value: "J",
                description: "",
                explanation: "",
                probability: 1,
                conviction: 1,
            }],
            previous_VAP_set_ids: ["VAP_set_id3", "VAP_set_id4"],
        },
    ],

}
