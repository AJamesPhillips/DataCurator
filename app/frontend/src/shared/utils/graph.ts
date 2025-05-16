import * as GraphLib from "graphlib"
import { Graph } from "graphlib"
const alg = (((GraphLib as any).default as typeof GraphLib) || GraphLib).alg



interface GGraph <T> extends Graph {
    node: (id: string) => T | undefined
}


interface MakeGraphArgs<E>
{
    items: E[]
    get_id: (item: E) => string
    get_tail_ids: (item: E) => string[]
    get_head_ids: (item: E) => string[]
}
export function make_graph <E> (args: MakeGraphArgs<E>): GGraph<E>
{
    const { items, get_id, get_head_ids, get_tail_ids } = args

    const graph = new Graph()
    items.forEach(item => graph.setNode(get_id(item), item))

    const id_exists = (id: string) => graph.hasNode(id)

    items.forEach(item =>
    {
        const id = get_id(item)
        get_head_ids(item).filter(id_exists).forEach(head_id => graph.setEdge(id, head_id))
        get_tail_ids(item).filter(id_exists).forEach(tail_id => graph.setEdge(tail_id, id))
    })
    return graph
}



interface FindLeafGroupsArgs<T>
{
    graph: GGraph<T>
}
// Could use an alogrithm like this: https://github.com/dagrejs/graphlib/wiki/API-Reference#predecessors
export function find_leaf_groups <T> (args: FindLeafGroupsArgs<T>): T[][]
{
    const { graph } = args

    const ids_to_nodes = factory_ids_to_nodes<T>(graph)

    return find_leaf_group_ids(args)
        .map(ids => ids_to_nodes(ids))
}



export function find_leaf_group_ids <T> (args: FindLeafGroupsArgs<T>): string[][]
{
    const { graph } = args
    const graph_groups = get_graph_groups({ graph })

    const group_ids: string[][] = []

    graph_groups.forEach(graph_group =>
    {
        const group_leaf_ids = find_leaf_ids(graph_group)
        // const connections = alg.dijkstraAll(graph_group)

        group_leaf_ids.forEach(group_leaf_id =>
        {
            const single_leaf_group_ids: string[] = [group_leaf_id, ...find_all_predecessor_ids(graph, group_leaf_id)]

            group_ids.push(single_leaf_group_ids)
        })

    })

    return group_ids
}



function get_graph_groups <T> (args: { graph: GGraph<T> }): GGraph<T>[]
{
    const { graph } = args
    const groups = alg.components(graph)

    return groups.map(group_ids =>
    {
        const new_graph = new Graph()
        group_ids.forEach(node_id => {
            new_graph.setNode(node_id, graph.node(node_id))
            const edges = graph.nodeEdges(node_id) || []
            edges.forEach(edge => new_graph.setEdge(edge))
        })
        return new_graph
    })
}



export function find_leaf_ids (graph: Graph): string[]
{
    const leaves = graph.nodes().filter(node_id =>
    {
        const successors = graph.successors(node_id) || []
        return successors.length === 0
    })

    return leaves
}



export function find_all_predecessor_ids (graph: Graph, node_id: string, allow_self: boolean = false): string[]
{
    const ids_to_explore: string[] = graph.predecessors(node_id) || []
    const predecessors: Set<string> = new Set()
    let id_to_explore: string = ids_to_explore.pop() || ""


    while (id_to_explore)
    {
        if (!predecessors.has(id_to_explore))
        {
            if (allow_self || id_to_explore !== node_id)
            {
                predecessors.add(id_to_explore)
                const predecessors_to_explore = (graph.predecessors(id_to_explore) || [])
                ids_to_explore.push(...predecessors_to_explore)
            }
        }

        id_to_explore = ids_to_explore.pop() || ""
    }

    return Array.from(predecessors)
}



// interface Leaves
// {
//     leaf_ids: string[]
//     // furthest_of_group: string[]
// }

// interface TempStore
// {
//     [id: string]: {
//         finished: boolean
//         leaf_ids: string[]
//         // other ids which are depending on the leaf_ids result of this id
//         depends_on_ids: Set<string>
//         // dependent_ids: string[]
//     }
// }

// function find_all_leaves (graph: Graph, starting_id: string, temp: TempStore = {}): string[]
    // const temp: TempStore = {}
    // const res = _find_leaves(graph, starting_id, temp)
    // if (res === "not_found") return undefined
    // if (res === "not_finished")
    // {
    //     temp[starting_id].depends_on_ids.forEach(id =>
    //     {
    //         temp[starting_id].leaf_ids.concat(temp[id].leaf_ids)
    //     })
    // }

    // // if (temp[id])
    // // {
    // //     // if (temp[id].finished) return temp[id].leaf_ids

    // //     // return temp[id]
    // // }

    // temp[id] = { finished: false, leaf_ids: [], dependent_ids: [], depends_on_ids: [] }

    // if (node.head_ids.size === 0)
    // {
    //     temp[id] = { finished: true, leaf_ids: [id], dependent_ids: [], depends_on_ids: [] }
    // }
    // else
    // {
    //     temp[id] = { finished: false, leaf_ids: [], dependent_ids: [] }
    //     graph[id].head_ids.forEach(head_id =>
    //     {
    //         const res = _find_leaves(graph, head_id, temp)
    //     })
    // }
// }



// interface GraphEdges
// {
//     [id: string]: NodeEdges
// }

// interface Graph<E>
// {
//     [id: string]: Node<E>
// }


// interface NodeEdges
// {
//     head_ids: Set<string>
//     tail_ids: Set<string>
// }

// interface Node <E> extends NodeEdges
// {
//     item: E
// }


// function _find_leaves (graph: GraphEdges, starting_id: string, temp: TempStore): "not_found" | "not_finished" | string[]
// {
//     let id = starting_id
//     let node = graph[id]
//     if (!node) return "not_found"

//     let temp_entry = temp[id]

//     if (!temp_entry)
//     {
//         temp_entry = { finished: false, leaf_ids: [], depends_on_ids: new Set() }
//         temp[id] = temp_entry

//         if (node.head_ids.size === 0)
//         {
//             temp_entry.finished = true
//             temp_entry.leaf_ids = [id]
//             // go through all dependent ids? and or  just return the list of ids?
//         }
//         else
//         {
//             let all_not_found = true
//             let all_finished = true
//             graph[id].head_ids.forEach(head_id =>
//             {
//                 const res = _find_leaves(graph, head_id, temp)
//                 if (res === "not_found")
//                 {
//                     // no op
//                 }
//                 else if (res === "not_finished")
//                 {
//                     all_finished = false
//                     all_not_found = false
//                     temp_entry.depends_on_ids.add(head_id)
//                 }
//                 else
//                 {
//                     all_not_found = false
//                     temp_entry.leaf_ids = temp_entry.leaf_ids.concat(res)
//                 }
//             })

//             if (all_not_found || all_finished)
//             {
//                 temp[id].finished = true
//                 if (all_not_found) temp[id].leaf_ids = [id]
//             }
//         }
//     }

//     if (temp_entry.finished) return temp_entry.leaf_ids
//     else return "not_finished"
// }



// interface MakeGraphArgs<E>
// {
//     items: E[]
//     get_id: (item: E) => string
//     get_tail_ids: (item: E) => string[]
//     get_head_ids: (item: E) => string[]
// }
// export function make_graph <E> (args: MakeGraphArgs<E>): Graph<E>
// {
//     const graph: Graph<E> = {}
//     const temp_graph: GraphEdges = {}

//     const { items, get_id, get_head_ids, get_tail_ids } = args

//     items.forEach(item =>
//     {
//         const id = get_id(item)
//         const own_heads = get_head_ids(item)
//         const own_tails = get_tail_ids(item)

//         let other_heads: string[] = []
//         let other_tails: string[] = []

//         const other_entry = temp_graph[id]
//         if (other_entry)
//         {
//             other_heads = Array.from(other_entry.head_ids)
//             other_tails = Array.from(other_entry.tail_ids)
//         }

//         const heads = new Set<string>(other_heads.concat(own_heads))
//         const tails = new Set<string>(other_tails.concat(own_tails))

//         graph[id] = {
//             item,
//             head_ids: heads,
//             tail_ids: tails,
//         }

//         // update others
//         own_heads.forEach(head_id =>
//         {
//             const tail_recipient = upsert_node(head_id, graph, temp_graph)
//             tail_recipient.tail_ids.add(id)
//         })

//         own_tails.forEach(tail_id =>
//         {
//             const head_recipient = upsert_node(tail_id, graph, temp_graph)
//             head_recipient.head_ids.add(id)
//         })
//     })

//     return graph
// }



// function upsert_node (id: string, graph: GraphEdges, mutate_graph: GraphEdges)
// {
//     let node: NodeEdges
//     node = graph[id]

//     if (!node)
//     {
//         if (!mutate_graph[id]) mutate_graph[id] = { head_ids: new Set(), tail_ids: new Set() }
//         node = mutate_graph[id]
//     }

//     return node
// }



function factory_ids_to_nodes <T> (graph: Graph): (ids: string[]) => T[]
{
    return (ids: string[]) => ids.map(id => graph.node(id))
}
