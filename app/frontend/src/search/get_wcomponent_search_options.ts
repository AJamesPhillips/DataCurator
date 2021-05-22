import type { AutoCompleteOption } from "../form/AutocompleteText"
import { get_title } from "../shared/wcomponent/rich_text/get_rich_text"
import type { WComponent, WComponentsById } from "../shared/wcomponent/interfaces/SpecialisedObjects"
import type { WcIdCounterfactualsMap } from "../shared/wcomponent/interfaces/uncertainty"



interface GetWcomponentSearchOptionsArgs
{
    wcomponents?: WComponent[]
    wcomponents_by_id: WComponentsById
    wc_id_counterfactuals_map: WcIdCounterfactualsMap | undefined
    created_at_ms: number
    sim_ms: number
}


export function get_wcomponent_search_options (args: GetWcomponentSearchOptionsArgs): AutoCompleteOption[]
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

            return {
                id: wcomponent.id,
                title,
                subtitle: `${wcomponent.title} -- @@${wcomponent.id}`,
            }
        })

    return options
}
