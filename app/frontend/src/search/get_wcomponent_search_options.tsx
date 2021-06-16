import { h } from "preact"

import type { AutocompleteOption } from "../form/Autocomplete/interfaces"
import { JudgementBadgeC } from "../knowledge/judgements/JudgementBadgeC"
import type { WcIdCounterfactualsMap } from "../shared/uncertainty/uncertainty"
import { WComponent, WComponentsById, wcomponent_is_judgement_or_objective } from "../shared/wcomponent/interfaces/SpecialisedObjects"
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

            let jsx: h.JSX.Element | undefined = undefined
            if (wcomponent_is_judgement_or_objective(wcomponent))
            {
                jsx = <div>
                    <JudgementBadgeC judgement_or_objective_id={wcomponent.id} />
                    {title}
                </div>
            }

            return {
                id: wcomponent.id,
                title,
                jsx,
                subtitle: `${wcomponent.title} -- @@${wcomponent.id}`,
            }
        })

    return options
}
