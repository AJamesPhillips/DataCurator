import type { RootState } from "../State"
import type { WComponentIdsByType } from "./State"



export const get_empty_wcomponent_ids_by_type = (): WComponentIdsByType => ({
    event: new Set(),
    state: new Set(),
    statev2: new Set(),
    process: new Set(),
    action: new Set(),
    actor: new Set(),
    causal_link: new Set(),
    relation_link: new Set(),
    judgement: new Set(),
    objective: new Set(),
    counterfactual: new Set(),
    goal: new Set(),
    prioritisation: new Set(),
})



export function get_wcomponent_ids_by_type (state: RootState, ids: string[])
{
    const wc_ids_by_type = get_empty_wcomponent_ids_by_type()

    ids.forEach(id =>
    {
        const wc = state.specialised_objects.wcomponents_by_id[id]
        if (!wc)
        {
            console.error(`Could not find wcomponent by id: ${id}`)
            return
        }

        wc_ids_by_type[wc.type].add(id)
    })

    return wc_ids_by_type
}
