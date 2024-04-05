import { describe, test } from "../../shared/utils/test"
import { CreationContextState } from "../../state/creation_context/state"
import { uuid_v4_for_tests } from "../../utils/uuid_v4_for_tests"
import { prepare_new_wcomponent_object } from "../../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import { StateValueAndPredictionsSet, WComponentNodeStateV2 } from "../../wcomponent/interfaces/state"
import { WcIdToCounterfactualsV2Map } from "../../wcomponent_derived/interfaces/counterfactual"
import { VAP_visual_false_id } from "../../wcomponent_derived/value_and_prediction/utils_to_convert_VAP_set_to_visuals"
import { replace_ids_in_text, get_title, ReplaceIdsArgs, RichTextType } from "./get_rich_text"



export const run_get_rich_text_tests = describe.delay("run_get_rich_text_tests", () =>
{
    let result: string

    describe("replace_ids_in_text", () =>
    {
        const id1 = uuid_v4_for_tests(1)
        const id2 = uuid_v4_for_tests(2)
        const id3 = uuid_v4_for_tests(3)


        const dt = new Date("2021-05-12")
        const ms = dt.getTime()

        const creation_context: CreationContextState = {
            use_creation_context: false,
            creation_context: { label_ids: [] },
        }

        const wcomponents_by_id = {
            [id1]: prepare_new_wcomponent_object({ base_id: -1, id: id1, title: `@@${id3} was told @@${id2} is here` }, creation_context),
            [id2]: prepare_new_wcomponent_object({ base_id: -1, id: id2, title: "Person A" }, creation_context),
            [id3]: prepare_new_wcomponent_object({ base_id: -1, id: id3, title: "Person B" }, creation_context),
        }
        const knowledge_views_by_id = {}

        const args: ReplaceIdsArgs = {
            text_type: RichTextType.rich,
            wcomponents_by_id,
            knowledge_views_by_id,
            wc_id_to_counterfactuals_map: undefined,
            created_at_ms: ms,
            sim_ms: ms,
        }

        result = replace_ids_in_text({
            ...args,
            text_type: RichTextType.raw,
            text: `Yesterday @@${id1} today`
        })
        test(result, `Yesterday @@${id1} today`, "Should not replace ids when text_type is RichTextType.raw")

        result = replace_ids_in_text({
            ...args,
            text_type: RichTextType.plain,
            text: `Yesterday @@${id1} today`
        })
        test(result, "Yesterday Person B was told Person A is here today", "Should replace ids with only text and no links when text_type is RichTextType.plain")

        result = replace_ids_in_text({
            ...args,
            text_type: RichTextType.rich,
            text: `Yesterday @@${id1} today`
        })
        test(result, `Yesterday [Person B was told Person A is here](#wcomponents/${id1}) today`, "Should replace ids with text and links when text_type is RichTextType.rich.  And should not render lower depth links so as not to have nested broken links.")
    })



    describe("get_title", () =>
    {
        const dt = new Date("2021-05-12")
        const ms = dt.getTime()

        const creation_context: CreationContextState = { use_creation_context: false, creation_context: {
            label_ids: [],
        } }

        const get_statev2 = (args: { id: string, title: string }) =>
        {
            const VAP_set: StateValueAndPredictionsSet = {
                id: "vps" + args.id,
                created_at: dt,
                base_id: -1,
                datetime: {},
                entries: [{
                    id: "VAP" + args.id,
                    explanation: "",
                    probability: 1,
                    conviction: 1,
                    value: "",
                    description: "",
                }],
            }

            return prepare_new_wcomponent_object({
                ...args,
                base_id: -1,
                type: "statev2",
                subtype: "boolean",
                values_and_prediction_sets: [VAP_set]
            }, creation_context) as WComponentNodeStateV2
        }

        const id1 = uuid_v4_for_tests(1)
        const id2 = uuid_v4_for_tests(2)
        const id3 = uuid_v4_for_tests(3)
        const id4 = uuid_v4_for_tests(4)
        const id5 = uuid_v4_for_tests(5)
        const id6 = uuid_v4_for_tests(6)
        const id7 = uuid_v4_for_tests(7)
        const id8 = uuid_v4_for_tests(8)
        const id9 = uuid_v4_for_tests(9)

        const wcomponent1 = get_statev2({ id: id1, title: "aaa" })
        const wcomponent2 = get_statev2({ id: id2, title: `bbb @@${id1}` })
        const wcomponent3 = get_statev2({ id: id3, title: "ccc ${value}" })
        const wcomponent4 = get_statev2({ id: id4, title: `ddd @@${id3}` })
        const wcomponent5 = get_statev2({ id: id5, title: `eee \${value} @@${id4}` })
        const wcomponent6 = get_statev2({ id: id6, title: `fff @@${id5}` })
        const wcomponent7 = get_statev2({ id: id7, title: `ggg @@${id6}` })
        const wcomponent8 = get_statev2({ id: id8, title: `Recursive @@${id8}` })
        const wcomponent9 = get_statev2({ id: id9, title: `Recursive @@${id9}.title` })

        const wcomponents_by_id = {
            [wcomponent1.id]: wcomponent1,
            [wcomponent2.id]: wcomponent2,
            [wcomponent3.id]: wcomponent3,
            [wcomponent4.id]: wcomponent4,
            [wcomponent5.id]: wcomponent5,
            [wcomponent6.id]: wcomponent6,
            [wcomponent7.id]: wcomponent7,
            [wcomponent8.id]: wcomponent8,
            [wcomponent9.id]: wcomponent9,
        }
        const knowledge_views_by_id = {}


        interface GetTitleForIdArgs
        {
            id: string
            text_type: RichTextType
            wc_id_to_counterfactuals_map?: WcIdToCounterfactualsV2Map
        }
        function get_title_for_id (args: GetTitleForIdArgs)
        {
            const { id, text_type, wc_id_to_counterfactuals_map } = args

            return get_title({
                text_type,
                wcomponents_by_id,
                knowledge_views_by_id,
                wcomponent: wcomponents_by_id[id]!,
                wc_id_to_counterfactuals_map,
                created_at_ms: ms,
                sim_ms: ms,
            })
        }


        describe("get_title", () =>
        {
            const expected_raw_text = {
                [wcomponent1.id]: "aaa",
                [wcomponent2.id]: `bbb @@${id1}`,
                [wcomponent3.id]: "ccc ${value}",
                [wcomponent4.id]: `ddd @@${id3}`,
                [wcomponent5.id]: `eee \${value} @@${id4}`,
            }
            const expected_plain_text = {
                [wcomponent1.id]: "aaa",
                [wcomponent2.id]: "bbb aaa",
                [wcomponent3.id]: "ccc True",
                [wcomponent4.id]: "ddd ccc True",
                [wcomponent5.id]: "eee True ddd ccc True",
            }
            const expected_rich_text = {
                [wcomponent1.id]: "aaa",
                [wcomponent2.id]: `bbb [aaa](#wcomponents/${id1})`,
                [wcomponent3.id]: "ccc True",
                [wcomponent4.id]: `ddd [ccc True](#wcomponents/${id3})`,
                [wcomponent5.id]: `eee True [ddd ccc True](#wcomponents/${id4})`,
            }


            Object.entries(expected_raw_text).forEach(([id, expected_title]) =>
            {
                result = get_title_for_id({ id, text_type: RichTextType.raw })
                test(result, expected_title)
            })

            Object.entries(expected_plain_text).forEach(([id, expected_title]) =>
            {
                result = get_title_for_id({ id, text_type: RichTextType.plain })
                test(result, expected_title)
            })

            Object.entries(expected_rich_text).forEach(([id, expected_title]) =>
            {
                result = get_title_for_id({ id, text_type: RichTextType.rich })
                test(result, expected_title)
            })
        })


        describe("depth_limit", () =>
        {
            result = get_title_for_id({ id: wcomponent7.id, text_type: RichTextType.rich })
            test(result, `ggg [fff eee True ddd @@${id3}](#wcomponents/${id6})`, "Should stop recursively rendering ids when a depth limit is reached")

            // We actually don't care too much about these recursive titles as
            // we don't expect these to be actually used by anyone.  We only care
            // that it should not crash (from too much recursion or stack overflow)
            result = get_title_for_id({ id: wcomponent8.id, text_type: RichTextType.rich })
            test(result, `Recursive [Recursive Recursive Recursive @@80000000-0000-4000-a000-000000000000](#wcomponents/80000000-0000-4000-a000-000000000000)`, "Should handle recursion for normal recursive titles.")

            // Should not crash with too much recursion or stack overflow
            result = get_title_for_id({ id: wcomponent9.id, text_type: RichTextType.rich })
            test(true, true, "Should handle recursion for '.title' functional ids of recursive titles.")
        })


        describe("counterfactuals", () =>
        {

            const expected_rich_text_counterfactual = {
                [wcomponent3.id]: "ccc False",
                [wcomponent4.id]: `ddd [ccc False](#wcomponents/${id3})`,
                [wcomponent5.id]: `eee True [ddd ccc False](#wcomponents/${id4})`,
            }

            const wc_id_to_counterfactuals_map: WcIdToCounterfactualsV2Map = {
                [wcomponent3.id]: {
                    VAP_sets: {
                        [`vps${id3}`]: [
                            {
                                id: "wc999000",
                                type: "counterfactualv2",
                                created_at: dt,
                                base_id: -1,
                                title: "",
                                description: "",
                                target_wcomponent_id: wcomponent3.id,
                                target_VAP_set_id: `vps${id3}`,
                                target_VAP_id: VAP_visual_false_id,
                            }
                        ]
                    }
                }
            }

            Object.entries(expected_rich_text_counterfactual).forEach(([id, expected_title]) =>
            {
                result = get_title_for_id({ id, text_type: RichTextType.rich, wc_id_to_counterfactuals_map })
                test(result, expected_title, "Should override values correctly using counterfactualv2 value")
            })
        })
    })


    describe.skip("replace_ids_in_text -> replace_calculations_with_results", () =>
    {
        const id1 = uuid_v4_for_tests(1)

        const dt = new Date("2023-08-14")
        const ms = dt.getTime()

        const creation_context: CreationContextState = {
            use_creation_context: false,
            creation_context: { label_ids: [] },
        }

        const wcomponents_by_id = {
            [id1]: prepare_new_wcomponent_object({ base_id: -1, id: id1, title: `UK Homes` }, creation_context),
            // [id2]: prepare_new_wcomponent_object({ base_id: -1, id: id2, title: "Person A" }, creation_context),
            // [id3]: prepare_new_wcomponent_object({ base_id: -1, id: id3, title: "Person B" }, creation_context),
        }

        const knowledge_views_by_id = {}

        const args: ReplaceIdsArgs = {
            text_type: RichTextType.rich,
            wcomponents_by_id,
            knowledge_views_by_id,
            wc_id_to_counterfactuals_map: undefined,
            created_at_ms: ms,
            sim_ms: ms,
        }


        let text = `
    $$!
    value: 123
    $$!
    `
        let result = replace_ids_in_text({ ...args, text })
        test(result, "\n123\n", "Should replace calculation with string value")
    })

})
