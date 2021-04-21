import { vertical_ordinal_to_y, x } from "../canvas/display"
import type { CanvasPoint } from "../canvas/interfaces"
import { memoize } from "../utils/memoize"
import type { Objective, ObjectiveNodeProps } from "./interfaces"


export const get_earliest_ms = memoize(_get_earliest_ms)

function _get_earliest_ms (objectives_data: Objective[])
{
    let min_earliest_ms = Number.POSITIVE_INFINITY
    objectives_data.forEach(({ created_at }) => min_earliest_ms = Math.min(min_earliest_ms, created_at.getTime()))
    return min_earliest_ms
}


export const get_objective_nodes_props_c = memoize(_get_objective_nodes_props)


function _get_objective_nodes_props (objectives: Objective[]): ObjectiveNodeProps[]
{
    const ids = new Set<string>()
    const objective_nodes_props: ObjectiveNodeProps[] = objectives.map(o =>
    {
        const objective_node_props = {
            ...o,
            vertical_ordinal: -1,
        }

        ids.add(objective_node_props.id)

        return objective_node_props
    })


    const preceeding_id_to_objective_map: { [id: string]: ObjectiveNodeProps } = {}
    objective_nodes_props.forEach(o =>
    {
        let preceeding_id = o.main.preceeding_id
        if (preceeding_id !== "" && !ids.has(preceeding_id))
        {
            console.warn(`Objective ${o.id} had preceeding_id of: ${preceeding_id} that does not exist.  Leaving with vertical_ordinal of -1`)
        }
        else
        {
            preceeding_id_to_objective_map[preceeding_id] = o
        }
    })


    if (!preceeding_id_to_objective_map[""])
    {
        console.warn(`Require at least one Objective with a position at the root.  Will pick one at random.`)
        const o = objective_nodes_props[0]
        preceeding_id_to_objective_map[""] = o
        delete preceeding_id_to_objective_map[o.main.preceeding_id]
    }

    let id = ""
    let vertical_ordinal = 0
    while (Object.keys(preceeding_id_to_objective_map).length)
    {
        const o = preceeding_id_to_objective_map[id]
        delete preceeding_id_to_objective_map[id]
        o.vertical_ordinal = vertical_ordinal++
        id = o.id
    }

    return objective_nodes_props
}


type GetObjectiveNodePositionArgs = {
    created_at: Date
    created_at_ms?: undefined
    vertical_ordinal: number
} | {
    created_at?: undefined
    created_at_ms: number
    vertical_ordinal: number
}

export function get_objective_node_position (args: GetObjectiveNodePositionArgs): CanvasPoint
{
    const ms = args.created_at ? args.created_at.getTime() : args.created_at_ms

    return {
        left: x(ms),
        top: vertical_ordinal_to_y(args.vertical_ordinal),
    }
}


// export function get_objective_nodes_props (data: Objective[], origin_ms: number, selected_objective_ids: Set<string>, priority_selected_objective_ids: Set<string>): ObjectiveNodeProps[]
// {
//     const x = x_factory(origin_ms)

//     return data.map((d, i) => {
//         const is_highlighted = selected_objective_ids.has(d.id) && priority_selected_objective_ids.size === 0
//         const is_priority_highlighted = priority_selected_objective_ids.has(d.id)
//         return get_objective_node_props(d, i, x, is_highlighted, is_priority_highlighted)
//     })
// }


// function get_objective_node_props (objective: Objective, vertical_position_ordinal: number, x: (ms: number) => number, is_highlighted: boolean, is_priority_highlighted: boolean): ObjectiveNodeProps
// {
//     const vertical_step = 100
//     const left = x(objective.created_at.getTime())
//     const top = vertical_position_ordinal * vertical_step

//     return {
//         ...objective,
//         position: { left, top },
//         connection_point_top: { left: 30, top: 0 },
//         connection_point_bottom: { left: 30, top: 50 },
//         // is_highlighted,
//         // is_priority_highlighted,
//     }
// }
