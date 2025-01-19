import { h } from "preact"

import type { AutocompleteOption } from "../form/Autocomplete/interfaces"
import type { KnowledgeViewsById } from "../shared/interfaces/knowledge_view"
import { JudgementBadgeConnected } from "../sharedf/judgement_badge/JudgementBadgeConnected"
import {
    WComponent,
    WComponentsById,
    wcomponent_is_judgement_or_objective,
    wcomponent_is_not_deleted,
    wcomponent_is_plain_connection,
} from "../wcomponent/interfaces/SpecialisedObjects"
import type { WcIdToCounterfactualsV2Map } from "../wcomponent_derived/interfaces/counterfactual"
import { RichTextType, get_title } from "../sharedf/rich_text/get_rich_text"



interface GetWcomponentSearchOptionsArgs
{
    wcomponents?: WComponent[]
    allowed_wcomponent_ids?: Set<string>
    wcomponents_by_id: WComponentsById
    knowledge_views_by_id: KnowledgeViewsById
    wc_id_to_counterfactuals_map: WcIdToCounterfactualsV2Map | undefined
    created_at_ms: number
    sim_ms: number
    exclude_ids?: Set<string>
    // include_deleted?: boolean
}


export function get_wcomponent_search_options (args: GetWcomponentSearchOptionsArgs): AutocompleteOption[]
{
    const {
        wcomponents: wcs, allowed_wcomponent_ids,
        wcomponents_by_id, knowledge_views_by_id, wc_id_to_counterfactuals_map,
        created_at_ms, sim_ms,
    } = args

    let wcomponents = wcs || Object.values(wcomponents_by_id)
    if (allowed_wcomponent_ids) wcomponents = wcomponents.filter(({ id }) => allowed_wcomponent_ids.has(id))

    const options = wcomponents
        .filter(wcomponent_is_not_deleted)
        .filter(wcomponent => !args.exclude_ids || !args.exclude_ids.has(wcomponent.id))
        .map(wcomponent => {
            const title = get_title({
                wcomponent,
                text_type: RichTextType.plain,
                wcomponents_by_id,
                knowledge_views_by_id,
                wc_id_to_counterfactuals_map,
                created_at_ms,
                sim_ms,
            })


            // For now we use raw description but perhaps better to use rendered one?
            let subtitle = `@@${wcomponent.id} -- ${wcomponent.title} -- ${wcomponent.description}`

            if (wcomponent_is_plain_connection(wcomponent))
            {
                subtitle += ` -- @@${wcomponent.from_id} -> @@${wcomponent.to_id}`
            }

            let jsx: h.JSX.Element | undefined = undefined
            if (wcomponent_is_judgement_or_objective(wcomponent))
            {
                jsx = <div>
                    <JudgementBadgeConnected judgement_or_objective_id={wcomponent.id} hide_judgement_trend={false} />
                    {title}
                </div>
            }

            return {
                id: wcomponent.id,
                title,
                jsx,
                raw_title: wcomponent.title,
                subtitle,
                color: wcomponent.label_color,
            }
        })

    return options
}
