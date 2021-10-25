import { h } from "preact"
import { useEffect, useState } from "preact/hooks"

import { SimulationSummary } from "./SimulationSummary"
import { get_simulations, Simulation } from "./simulations"
import { supabase_load_data } from "../state/sync/supabase/supabase_load_data"
import type { WComponentsById } from "../wcomponent/interfaces/SpecialisedObjects"
import type { KnowledgeViewsById } from "../shared/interfaces/knowledge_view"
import { get_items_by_id } from "../shared/utils/get_items"



const initial_data = {}

export function SimHome ()
{
    const [knowledge_views_by_id, set_knowledge_views_by_id] = useState<KnowledgeViewsById>(initial_data)
    const [wcomponents_by_id, set_wcomponents_by_id] = useState<WComponentsById>({})
    const [simulations, set_simulations] = useState<Simulation[]>([])

    useEffect(() =>
    {
        supabase_load_data(true, 14).then(data =>
        {
            set_knowledge_views_by_id(get_items_by_id(data.knowledge_views, ""))
            set_wcomponents_by_id(get_items_by_id(data.wcomponents, ""))
        })
        get_simulations().then(sims => set_simulations(sims))
    }, [])


    if (knowledge_views_by_id === initial_data) return <div><h2>Simulations</h2>Loading...</div>


    return <div>
        <h2>Simulations</h2>

        {simulations.map(simulation => <SimulationSummary
            simulation={simulation}
            knowledge_views_by_id={knowledge_views_by_id}
            wcomponents_by_id={wcomponents_by_id}
        />)}
    </div>
}
