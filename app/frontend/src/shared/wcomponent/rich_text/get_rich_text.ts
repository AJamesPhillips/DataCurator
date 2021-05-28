import type { CreationContextState } from "../../interfaces"
import { test } from "../../utils/test"
import { get_new_wcomponent_object } from "../get_new_wcomponent_object"
import { get_wcomponent_state_value } from "../get_wcomponent_state_value"
import type { WComponentsById, WComponent } from "../interfaces/SpecialisedObjects"
import type { StateValueAndPredictionsSet, WComponentNodeStateV2 } from "../interfaces/state"
import type { WcIdCounterfactualsMap } from "../interfaces/uncertainty/uncertainty"
import { replace_function_ids_in_text } from "./replace_function_ids"
import { replace_normal_ids } from "./replace_normal_ids"



const DEFAULT_MAX_DEPTH_LIMIT = 3


interface ReplaceIdsArgs
{
    rich_text: boolean
    render_links?: boolean
    wcomponents_by_id: WComponentsById
    wc_id_counterfactuals_map: WcIdCounterfactualsMap | undefined
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
        wcomponent, wc_id_counterfactuals_map, created_at_ms, sim_ms,
    } = args

    if (!args.rich_text) return wcomponent.title

    const title = wcomponent.title
    const text = replace_value_in_text({ text: title, wcomponent, wc_id_counterfactuals_map, created_at_ms, sim_ms })

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
    wc_id_counterfactuals_map: WcIdCounterfactualsMap | undefined
    created_at_ms: number
    sim_ms: number
}
export function replace_value_in_text (args: ReplaceValueInTextArgs)
{
    let { text, wcomponent, wc_id_counterfactuals_map = {} } = args

    if (!text.includes("${value}")) return text

    const wc_counterfactuals = wc_id_counterfactuals_map[wcomponent.id]

    const value = get_wcomponent_state_value({
        wcomponent,
        wc_counterfactuals,
        created_at_ms: args.created_at_ms,
        sim_ms: args.sim_ms,
    }).value

    text = text.replace(/\$\{value\}/g, `${value}`)
    return text
}


interface ReplaceIdsInTextArgs extends ReplaceIdsArgs
{
    text: string
}
export function replace_ids_in_text (args: ReplaceIdsInTextArgs): string
{
    const {
        text, rich_text, render_links, wcomponents_by_id,
        depth_limit = DEFAULT_MAX_DEPTH_LIMIT,
        current_depth = 0,
        root_url = "",
        wc_id_counterfactuals_map,
        created_at_ms,
        sim_ms,
    } = args

    if (!rich_text) return text

    const replaced_text = _replace_ids_in_text(text, wcomponents_by_id, render_links, depth_limit, current_depth, root_url, wc_id_counterfactuals_map, created_at_ms, sim_ms)

    return replaced_text
}



function _replace_ids_in_text (text: string, wcomponents_by_id: WComponentsById, render_links: boolean | undefined, depth_limit: number, current_depth: number, root_url: string, wc_id_counterfactuals_map: WcIdCounterfactualsMap | undefined, created_at_ms: number, sim_ms: number)
{
    render_links = render_links === false ? false : current_depth === 0


    text = replace_function_ids_in_text(text, wcomponents_by_id, render_links, root_url)

    function _get_title (wcomponent: WComponent)
    {
        return get_title({
            rich_text: true,
            render_links,
            wcomponents_by_id,
            wc_id_counterfactuals_map,
            created_at_ms,
            sim_ms,
            depth_limit,
            current_depth: current_depth + 1,
            root_url,
            wcomponent,
        })
    }

    text = replace_normal_ids(text, wcomponents_by_id, depth_limit, current_depth, render_links, root_url, _get_title)

    return text
}




function test_replace_ids_in_text ()
{
    console. log("running tests of replace_ids_in_text")

    const dt = new Date("2021-05-12")
    const ms = dt.getTime()

    const creation_context: CreationContextState = { use_creation_context: false, creation_context: {} }

    const wcomponents_by_id = {
        "123": get_new_wcomponent_object({ id: "123", title: "@@789 was told @@456 is here" }, creation_context),
        "456": get_new_wcomponent_object({ id: "456", title: "Person A" }, creation_context),
        "789": get_new_wcomponent_object({ id: "789", title: "Person B" }, creation_context),
    }

    let result: string

    const args: ReplaceIdsArgs = {
        rich_text: true,
        wcomponents_by_id,
        wc_id_counterfactuals_map: undefined,
        created_at_ms: ms,
        sim_ms: ms,
    }

    result = replace_ids_in_text({
        ...args,
        rich_text: false,
        text: "Yesterday @@123 today"
    })
    test(result, "Yesterday @@123 today")

    result = replace_ids_in_text({
        ...args,
        rich_text: true,
        text: "Yesterday @@123 today"
    })
    test(result, "Yesterday [Person B was told Person A is here](#wcomponents/123&view=knowledge) today")

    result = replace_ids_in_text({
        ...args,
        rich_text: true,
        render_links: false,
        text: "Yesterday @@123 today"
    })
    test(result, "Yesterday Person B was told Person A is here today")
}



function test_rendering_title ()
{
    console. log("running tests of get_title")

    const dt = new Date("2021-05-12")
    const ms = dt.getTime()

    const creation_context: CreationContextState = { use_creation_context: false, creation_context: {} }

    const get_statev2 = (args: { id: string, title: string }) =>
    {
        const VAP_set: StateValueAndPredictionsSet = {
            id: "vps" + args.id,
            version: 1,
            created_at: dt,
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

        return get_new_wcomponent_object({
            ...args,
            type: "statev2",
            subtype: "boolean",
            values_and_prediction_sets: [VAP_set]
        }, creation_context) as WComponentNodeStateV2
    }

    const wcomponent1 = get_statev2({ id: "111", title: "aaa" })
    const wcomponent2 = get_statev2({ id: "222", title: "bbb @@111" })
    const wcomponent3 = get_statev2({ id: "333", title: "ccc ${value}" })
    const wcomponent4 = get_statev2({ id: "444", title: "ddd @@333" })
    const wcomponent5 = get_statev2({ id: "555", title: "eee ${value} @@444" })
    const wcomponent6 = get_statev2({ id: "666", title: "fff @@555" })
    const wcomponent7 = get_statev2({ id: "777", title: "ggg @@666" })

    const wcomponents_by_id = {
        [wcomponent1.id]: wcomponent1,
        [wcomponent2.id]: wcomponent2,
        [wcomponent3.id]: wcomponent3,
        [wcomponent4.id]: wcomponent4,
        [wcomponent5.id]: wcomponent5,
        [wcomponent6.id]: wcomponent6,
        [wcomponent7.id]: wcomponent7,
    }


    const expected_non_rich_text = {
        [wcomponent1.id]: "aaa",
        [wcomponent2.id]: "bbb @@111",
        [wcomponent3.id]: "ccc ${value}",
        [wcomponent4.id]: "ddd @@333",
        [wcomponent5.id]: "eee ${value} @@444",
    }
    const expected_rich_text = {
        [wcomponent1.id]: "aaa",
        [wcomponent2.id]: "bbb [aaa](#wcomponents/111&view=knowledge)",
        [wcomponent3.id]: "ccc True",
        [wcomponent4.id]: "ddd [ccc True](#wcomponents/333&view=knowledge)",
        [wcomponent5.id]: "eee True [ddd ccc True](#wcomponents/444&view=knowledge)",
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
        [wcomponent4.id]: "ddd [ccc False](#wcomponents/333&view=knowledge)",
        [wcomponent5.id]: "eee True [ddd ccc False](#wcomponents/444&view=knowledge)",
    }



    interface GetTitleForIdArgs
    {
        id: string
        rich_text: boolean
        render_links?: boolean
        wc_id_counterfactuals_map?: WcIdCounterfactualsMap
    }
    function get_title_for_id (args: GetTitleForIdArgs)
    {
        const { id, rich_text, render_links, wc_id_counterfactuals_map } = args

        return get_title({
            rich_text,
            render_links,
            wcomponents_by_id,
            wcomponent: wcomponents_by_id[id]!,
            wc_id_counterfactuals_map,
            created_at_ms: ms,
            sim_ms: ms,
        })
    }


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

    // Test depth limit
    const result = get_title_for_id({ id: wcomponent7.id, rich_text: true })
    test(result, "ggg [fff eee True ddd @@333](#wcomponents/666&view=knowledge)")


    const wc_id_counterfactuals_map: WcIdCounterfactualsMap = {
        [wcomponent3.id]: {
            VAP_set: {
                "vps333": {
                    "VAP333": {
                        id: "wc999000",
                        created_at: dt,
                        title: "",
                        description: "",
                        type: "counterfactual",
                        target_wcomponent_id: wcomponent3.id,
                        target_VAP_set_id: "vps333",
                        target_VAP_id: "VAP333",
                        probability: 0,
                        conviction: 1,
                    }
                }
            }
        }
    }

    Object.entries(expected_rich_text_counterfactual).forEach(([id, expected_title]) =>
    {
        const result = get_title_for_id({ id, rich_text: true, wc_id_counterfactuals_map })
        test(result, expected_title)
    })

}



function run_tests ()
{
    test_replace_ids_in_text()
    test_rendering_title()
}

// run_tests()
