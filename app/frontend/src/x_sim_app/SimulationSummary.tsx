import { h } from "preact"

import type { KnowledgeViewsById } from "../shared/interfaces/knowledge_view"
import type { WComponentsById } from "../wcomponent/interfaces/SpecialisedObjects"
import type { Simulation } from "./simulations"
import { SimulationScenarioSummary } from "./SimulationScenarioSummary"



interface OwnProps
{
    simulation: Simulation
    knowledge_views_by_id: KnowledgeViewsById
    wcomponents_by_id: WComponentsById
}



export function SimulationSummary (props: OwnProps)
{
    const { base_knowledge_view_id, scenario_knowledge_view_ids } = props.simulation
    const { knowledge_views_by_id, wcomponents_by_id } = props
    const base_kv = knowledge_views_by_id[base_knowledge_view_id]

    if (!base_kv) return <div>Unknown simulation base knowledge view for id: {base_knowledge_view_id}</div>


    const created_at_ms = new Date().getTime()
    const sim_ms = created_at_ms


    return <div>
        <h4>{base_kv.title}</h4>

        <i>Scenarios</i>
        {scenario_knowledge_view_ids.map(id =>
            <SimulationScenarioSummary
                key={id}
                simulation={props.simulation}
                scenario_kv_id={id}
                knowledge_views_by_id={knowledge_views_by_id}
                wcomponents_by_id={wcomponents_by_id}
                created_at_ms={created_at_ms}
                sim_ms={sim_ms}
            />
        )}
    </div>
}
