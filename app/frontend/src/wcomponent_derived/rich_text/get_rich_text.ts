import type { KnowledgeViewsById } from "../../shared/interfaces/knowledge_view"
import { test } from "../../shared/utils/test"
import type { CreationContextState } from "../../state/creation_context/state"
import { uuid_v4_for_tests } from "../../utils/uuid_v4_for_tests"
import { prepare_new_wcomponent_object } from "../../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import type {
    WComponentsById,
    WComponent,
} from "../../wcomponent/interfaces/SpecialisedObjects"
import type { StateValueAndPredictionsSet, WComponentNodeStateV2 } from "../../wcomponent/interfaces/state"
import { get_wcomponent_state_UI_value } from "../get_wcomponent_state_UI_value"
import type { WcIdToCounterfactualsV2Map } from "../interfaces/counterfactual"
import { VAP_visual_false_id } from "../value_and_prediction/utils_to_convert_VAP_set_to_visuals"
import { get_default_wcomponent_title } from "./get_default_wcomponent_title"
import type { ReplaceNormalIdsInTextArgs, ReplaceFunctionIdsInTextArgs } from "./interfaces"
import { replace_function_ids_in_text } from "./replace_function_ids"
import { replace_normal_ids } from "./replace_normal_ids"



const DEFAULT_MAX_DEPTH_LIMIT = 3


interface ReplaceIdsArgs
{
    rich_text: boolean
    render_links?: boolean
    wcomponents_by_id: WComponentsById
    knowledge_views_by_id: KnowledgeViewsById
    wc_id_to_counterfactuals_map: WcIdToCounterfactualsV2Map | undefined
    created_at_ms: number
    sim_ms: number
    depth_limit?: number
    current_depth?: number
    root_url?: string
}


export interface GetFieldTextArgs extends ReplaceIdsArgs
{
    wcomponent: WComponent
}
export function get_title (args: GetFieldTextArgs): string
{
    const {
        wcomponent, wc_id_to_counterfactuals_map, created_at_ms, sim_ms,
    } = args

    if (!args.rich_text) return wcomponent.title

    let title = wcomponent.title
    if (!title) title = get_default_wcomponent_title(args)

    const text = replace_value_in_text({ text: title, wcomponent, wc_id_to_counterfactuals_map, created_at_ms, sim_ms })

    return replace_ids_in_text({ ...args, text })
}

export function get_description (args: GetFieldTextArgs): string
{
    const text = args.wcomponent.description

    return replace_ids_in_text({ ...args, text })
}



interface ReplaceValueInTextArgs
{
    text: string
    wcomponent: WComponent
    wc_id_to_counterfactuals_map: WcIdToCounterfactualsV2Map | undefined
    created_at_ms: number
    sim_ms: number
}
function replace_value_in_text (args: ReplaceValueInTextArgs)
{
    let { text, wcomponent, wc_id_to_counterfactuals_map = {} } = args

    if (!text.includes("${value}")) return text

    const VAP_set_id_to_counterfactual_v2_map = wc_id_to_counterfactuals_map[wcomponent.id]?.VAP_sets

    const value = get_wcomponent_state_UI_value({
        wcomponent,
        VAP_set_id_to_counterfactual_v2_map,
        created_at_ms: args.created_at_ms,
        sim_ms: args.sim_ms,
    })

    text = text.replace(/\$\{value\}/g, `${value.values_string}`)
    return text
}


interface ReplaceIdsInTextArgs extends ReplaceIdsArgs
{
    text: string
}
export function replace_ids_in_text (args: ReplaceIdsInTextArgs): string
{
    const {
        text, rich_text, render_links, wcomponents_by_id, knowledge_views_by_id,
        depth_limit = DEFAULT_MAX_DEPTH_LIMIT,
        current_depth = 0,
        root_url = "",
        wc_id_to_counterfactuals_map,
        created_at_ms,
        sim_ms,
    } = args

    if (!rich_text) return text

    const replaced_text = _replace_ids_in_text(text, wcomponents_by_id, knowledge_views_by_id, render_links, depth_limit, current_depth, root_url, wc_id_to_counterfactuals_map, created_at_ms, sim_ms)

    return replaced_text
}



function _replace_ids_in_text (text: string, wcomponents_by_id: WComponentsById, knowledge_views_by_id: KnowledgeViewsById, render_links: boolean | undefined, depth_limit: number, current_depth: number, root_url: string, wc_id_to_counterfactuals_map: WcIdToCounterfactualsV2Map | undefined, created_at_ms: number, sim_ms: number)
{
    // TODO: document why we do not render links at top level i.e. when current_depth === 0 ?
    render_links = render_links === false ? false : current_depth === 0

    function _get_title (wcomponent: WComponent)
    {
        return get_title({
            rich_text: true,
            render_links,
            wcomponents_by_id,
            knowledge_views_by_id,
            wc_id_to_counterfactuals_map,
            created_at_ms,
            sim_ms,
            depth_limit,
            current_depth: current_depth + 1,
            root_url,
            wcomponent,
        })
    }

    const args: ReplaceNormalIdsInTextArgs & ReplaceFunctionIdsInTextArgs = {
        wcomponents_by_id,
        knowledge_views_by_id,
        depth_limit,
        render_links,
        root_url,
        get_title: _get_title,
    }

    text = replace_function_ids_in_text(text, current_depth, args)
    text = replace_normal_ids(text, current_depth, args)

    return text
}




function test_replace_ids_in_text ()
{
    console. log("running tests of replace_ids_in_text")

    const id1 = uuid_v4_for_tests(1)
    const id2 = uuid_v4_for_tests(2)
    const id3 = uuid_v4_for_tests(3)


    const dt = new Date("2021-05-12")
    const ms = dt.getTime()

    const creation_context: CreationContextState = { use_creation_context: false, creation_context: {
        label_ids: [],
    } }

    const wcomponents_by_id = {
        [id1]: prepare_new_wcomponent_object({ base_id: -1, id: id1, title: `@@${id3} was told @@${id2} is here` }, creation_context),
        [id2]: prepare_new_wcomponent_object({ base_id: -1, id: id2, title: "Person A" }, creation_context),
        [id3]: prepare_new_wcomponent_object({ base_id: -1, id: id3, title: "Person B" }, creation_context),
    }
    const knowledge_views_by_id = {}

    let result: string

    const args: ReplaceIdsArgs = {
        rich_text: true,
        wcomponents_by_id,
        knowledge_views_by_id,
        wc_id_to_counterfactuals_map: undefined,
        created_at_ms: ms,
        sim_ms: ms,
    }

    result = replace_ids_in_text({
        ...args,
        rich_text: false,
        text: `Yesterday @@${id1} today`
    })
    test(result, `Yesterday @@${id1} today`)

    result = replace_ids_in_text({
        ...args,
        rich_text: true,
        text: `Yesterday @@${id1} today`
    })
    test(result, `Yesterday [Person B was told Person A is here](#wcomponents/${id1}) today`)

    result = replace_ids_in_text({
        ...args,
        rich_text: true,
        render_links: false,
        text: `Yesterday @@${id1} today`
    })
    test(result, "Yesterday Person B was told Person A is here today")
}



function test_rendering_title ()
{
    console. log("running tests of get_title")

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


    const expected_non_rich_text = {
        [wcomponent1.id]: "aaa",
        [wcomponent2.id]: `bbb @@${id1}`,
        [wcomponent3.id]: "ccc ${value}",
        [wcomponent4.id]: `ddd @@${id3}`,
        [wcomponent5.id]: `eee \${value} @@${id4}`,
    }
    const expected_rich_text = {
        [wcomponent1.id]: "aaa",
        [wcomponent2.id]: `bbb [aaa](#wcomponents/${id1})`,
        [wcomponent3.id]: "ccc True",
        [wcomponent4.id]: `ddd [ccc True](#wcomponents/${id3})`,
        [wcomponent5.id]: `eee True [ddd ccc True](#wcomponents/${id4})`,
    }
    const expected_rich_text_no_links = {
        [wcomponent1.id]: "aaa",
        [wcomponent2.id]: "bbb aaa",
        [wcomponent3.id]: "ccc True",
        [wcomponent4.id]: "ddd ccc True",
        [wcomponent5.id]: "eee True ddd ccc True",
    }
    const expected_rich_text_counterfactual = {
        [wcomponent3.id]: "ccc False",
        [wcomponent4.id]: `ddd [ccc False](#wcomponents/${id3})`,
        [wcomponent5.id]: `eee True [ddd ccc False](#wcomponents/${id4})`,
    }


    interface GetTitleForIdArgs
    {
        id: string
        rich_text: boolean
        render_links?: boolean
        wc_id_to_counterfactuals_map?: WcIdToCounterfactualsV2Map
    }
    function get_title_for_id (args: GetTitleForIdArgs)
    {
        const { id, rich_text, render_links, wc_id_to_counterfactuals_map } = args

        return get_title({
            rich_text,
            render_links,
            wcomponents_by_id,
            knowledge_views_by_id,
            wcomponent: wcomponents_by_id[id]!,
            wc_id_to_counterfactuals_map,
            created_at_ms: ms,
            sim_ms: ms,
        })
    }


    function test_get_title ()
    {
        Object.entries(expected_non_rich_text).forEach(([id, expected_title]) =>
        {
            const result = get_title_for_id({ id, rich_text: false })
            test(result, expected_title)
        })

        Object.entries(expected_rich_text).forEach(([id, expected_title]) =>
        {
            const result = get_title_for_id({ id, rich_text: true })
            test(result, expected_title)
        })

        Object.entries(expected_rich_text_no_links).forEach(([id, expected_title]) =>
        {
            const result = get_title_for_id({ id, rich_text: true, render_links: false })
            test(result, expected_title)
        })

    }


    function test_depth_limit ()
    {
        const result = get_title_for_id({ id: wcomponent7.id, rich_text: true })
        test(result, `ggg [fff eee True ddd @@${id3}](#wcomponents/${id6})`)
    }


    function test_counterfactuals ()
    {
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
            const result = get_title_for_id({ id, rich_text: true, wc_id_to_counterfactuals_map })
            test(result, expected_title)
        })
    }


    function test_rendering_recursive_title ()
    {
        // We do not really care about the result, just the fact that it doesn't crash with a
        // "Too much recursion" or "Stack overflow"
        const result = get_title_for_id({ id: id8, rich_text: true })
        const result2 = get_title_for_id({ id: id9, rich_text: true })
    }


    test_get_title()
    test_depth_limit()
    test_counterfactuals()
    test_rendering_recursive_title()
}



function run_tests ()
{
    test_replace_ids_in_text()
    test_rendering_title()
}

// run_tests()
