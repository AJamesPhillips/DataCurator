import { h } from "preact"

import type { AutocompleteOption } from "../form/Autocomplete/interfaces"
import { JudgementBadgeConnected } from "../sharedf/judgement_badge/JudgementBadgeConnected"
import type { WcIdToCounterfactualsV2Map } from "../wcomponent/interfaces/counterfactual"
import {
    WComponent,
    WComponentsById,
    wcomponent_is_judgement_or_objective,
    wcomponent_is_plain_connection,
} from "../wcomponent/interfaces/SpecialisedObjects"
import { get_title } from "../wcomponent_derived/rich_text/get_rich_text"



interface GetWcomponentSearchOptionsArgs
{
    wcomponents?: WComponent[]
    wcomponents_by_id: WComponentsById
    wc_id_to_counterfactuals_map: WcIdToCounterfactualsV2Map | undefined
    created_at_ms: number
    sim_ms: number
    include_deleted?: boolean
}


export function get_wcomponent_search_options (args: GetWcomponentSearchOptionsArgs): AutocompleteOption[]
{
    const { wcomponents: wcs, wcomponents_by_id, wc_id_to_counterfactuals_map, created_at_ms, sim_ms, include_deleted } = args

    const wcomponents = wcs || Object.values(wcomponents_by_id)

    const options = wcomponents
        .filter(wc => include_deleted || !wc.deleted_at)
        .map(wcomponent => {
            const title = get_title({
                wcomponent,
                rich_text: true,
                render_links: false,
                wcomponents_by_id,
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
                    <JudgementBadgeConnected judgement_or_objective_id={wcomponent.id} />
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
