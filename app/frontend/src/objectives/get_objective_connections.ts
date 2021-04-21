import { memoize } from "../utils/memoize"
import type { ObjectiveConnection, ObjectiveNodeProps } from "./interfaces"


export const get_objective_connections_props_c = memoize(_get_objective_connections_props)


function _get_objective_connections_props (objectives: ObjectiveNodeProps[]): ObjectiveConnection[]
{
    const connections: ObjectiveConnection[] = []

    const objectives_id_maps: { [id: string]: ObjectiveNodeProps } = {}

    objectives.forEach(objective => {
        objectives_id_maps[objective.id] = objective
    })

    objectives.forEach(objective => {
        objective.caused_by.forEach(caused_by_id =>
        {
            const caused_by_objective = objectives_id_maps[caused_by_id]
            if (!caused_by_objective)
            {
                console.error(`No caused_by_objective found for caused_by_id: ${caused_by_id}`)
                return
            }

            connections.push({
                from_id: objective.id,
                from_ms: objective.created_at.getTime(),
                from_vertical_ordinal: objective.vertical_ordinal,

                to_id: caused_by_id,
                to_ms: caused_by_objective.created_at.getTime(),
                to_vertical_ordinal: caused_by_objective.vertical_ordinal,
            })
        })
    })

    return connections
}

