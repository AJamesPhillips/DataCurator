import { h } from "preact"

import type { AutocompleteOption } from "../form/Autocomplete/interfaces"
import { JudgementBadgeConnected } from "../knowledge/judgements/JudgementBadgeConnected"
import type { WcIdCounterfactualsMap } from "../shared/uncertainty/uncertainty"
import {
    WComponent,
    WComponentsById,
    wcomponent_is_judgement_or_objective,
    wcomponent_is_plain_connection,
} from "../shared/wcomponent/interfaces/SpecialisedObjects"
import { get_title } from "../shared/wcomponent/rich_text/get_rich_text"



interface GetWcomponentSearchOptionsArgs
{
    wcomponents?: WComponent[]
    wcomponents_by_id: WComponentsById
    wc_id_counterfactuals_map: WcIdCounterfactualsMap | undefined
    created_at_ms: number
    sim_ms: number
}


export function get_wcomponent_search_options (args: GetWcomponentSearchOptionsArgs): AutocompleteOption[]
{
    const { wcomponents: wcs, wcomponents_by_id, wc_id_counterfactuals_map, created_at_ms, sim_ms } = args

    const wcomponents = wcs || Object.values(wcomponents_by_id)

    const options = wcomponents
        .map(wcomponent => {
            const title = get_title({
                wcomponent,
                rich_text: true,
                render_links: false,
                wcomponents_by_id,
                wc_id_counterfactuals_map,
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
                    <JudgementBadgeConnected judgement_or_objective_id={wcomponent.id} />
                    {title}
                </div>
            }

            return {
                id: wcomponent.id,
                title,
                jsx,
                subtitle,
                color: wcomponent.label_color,
            }
        })

    return options
}



            // // limiting length due to: https://github.com/farzher/fuzzysort/issues/80
            // const limit = 150
            // let limited_title = title.slice(0, limit)
            // let limited_subtitle = wcomponent.title.slice(0, limit)

            // if (limited_title.length !== title.length) limited_title += "..."
            // if (limited_subtitle.length !== wcomponent.title.length) limited_subtitle += "..."
