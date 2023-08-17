import type { KnowledgeViewsById } from "../../shared/interfaces/knowledge_view"
import type {
    WComponentsById,
    WComponent,
} from "../../wcomponent/interfaces/SpecialisedObjects"
import { get_wcomponent_state_UI_value } from "../../wcomponent_derived/get_wcomponent_state_UI_value"
import type { WcIdToCounterfactualsV2Map } from "../../wcomponent_derived/interfaces/counterfactual"
import { get_default_wcomponent_title } from "./get_default_wcomponent_title"
import type { ReplaceNormalIdsInTextArgs, ReplaceFunctionIdsInTextArgs } from "./interfaces"
import { replace_calculations_with_results } from "./calculations/replace_calculations_with_results"
import { replace_function_ids_in_text } from "./replace_function_ids"
import { replace_normal_ids } from "./replace_normal_ids"



const DEFAULT_MAX_DEPTH_LIMIT = 3


export interface ReplaceIdsArgs
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

    let title = wcomponent.title
    if (!title) title = get_default_wcomponent_title(args)

    if (!args.rich_text) return title

    const text = replace_value_in_text({ text: title, wcomponent, wc_id_to_counterfactuals_map, created_at_ms, sim_ms })

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
    text = replace_calculations_with_results(text, { ...args, created_at_ms, sim_ms })
    text = replace_normal_ids(text, current_depth, args)

    return text
}
