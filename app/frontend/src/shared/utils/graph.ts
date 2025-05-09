import * as GraphLib from "graphlib"
import { Graph } from "graphlib"
const alg = (((GraphLib as any).default as typeof GraphLib) || GraphLib).alg

import { describe, test } from "./test"



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



function find_leaf_group_ids <T> (args: FindLeafGroupsArgs<T>): string[][]
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



function find_leaf_ids_for_id (graph: Graph, node_id: string): string[]
{
    // May want to First split graph into components for optimisation?

    const leaf_ids = find_leaf_ids(graph)

    const connections = alg.dijkstra(graph, node_id)

    return leaf_ids.filter(leaf_id => connections[leaf_id]!.distance < Number.POSITIVE_INFINITY)
}



function find_all_predecessor_ids (graph: Graph, node_id: string, allow_self: boolean = false): string[]
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



export const test_graph_related_functions = describe.delay("graph related functions", () =>
{
    interface I
    {
        id: string
        head_ids: string[]
        tail_ids: string[]
    }

    const get_id = (i: I) => i.id
    const get_head_ids = (i: I) => i.head_ids
    const get_tail_ids = (i: I) => i.tail_ids


    const helper_func__make_graph = (items: I[]) =>
    {
        return make_graph({ items, get_id, get_head_ids, get_tail_ids })
    }


    function helper_func__test_graph (graph: Graph, id: string, expected: { item?: I; head_ids: string[]; tail_ids: string[] } )
    {
        test(graph.node(id), expected.item)
        const out = graph.outEdges(id) || []
        test(out.map(e => e.w), expected.head_ids)
        const ins = graph.inEdges(id) || []
        test(ins.map(e => e.v), expected.tail_ids)
    }


    function helper_func__simple_graph ()
    {
        const items = [{ id: "1", head_ids: [], tail_ids: [] }]
        const graph = helper_func__make_graph(items)
        return { items, graph }
    }


    function helper_func__simple_circular_and_leaf ()
    {
        const items = [
            // Circular + leaf
            { id: "1", head_ids: ["2", "4"], tail_ids: [] },
            { id: "2", head_ids: ["1", "3"], tail_ids: [] },
            // leaves
            { id: "3", head_ids: [], tail_ids: [] },
            { id: "4", head_ids: [], tail_ids: [] },
        ]
        //   /--> 4
        //  1 --> 2 --> 3
        //  ^----/
        const graph = helper_func__make_graph(items)
        return { items, graph }
    }


    function helper_func__simple_multi_group_graph ()
    {
        const items = [
            { id: "1", head_ids: ["2"], tail_ids: [] },
            { id: "2", head_ids: [], tail_ids: [] },
            // group 2
            { id: "3", head_ids: [], tail_ids: [] },
            // group 3
            { id: "4", head_ids: ["5"], tail_ids: [] },
            { id: "5", head_ids: [], tail_ids: [] },
        ]
        const graph = helper_func__make_graph(items)
        return { items, graph }
    }


    function helper_func__multi_group_graph ()
    {
        const items = [
            // disconnected (group 1)
            { id: "1", head_ids: [], tail_ids: [] },
            // Ascending Connected in group 2
            { id: "2", head_ids: ["3"], tail_ids: [] },
            { id: "3", head_ids: ["4"], tail_ids: [] },
            { id: "4", head_ids: [], tail_ids: [] },
            // Descending Connected in group 3
            { id: "5", head_ids: [], tail_ids: [] },
            { id: "6", head_ids: ["5"], tail_ids: [] },
            { id: "7", head_ids: ["6"], tail_ids: [] },
            // Circular Connected in group 4
            { id: "8", head_ids: ["10"], tail_ids: [] },
            { id: "9", head_ids: ["8"], tail_ids: [] },
            { id: "10", head_ids: ["9"], tail_ids: [] },
            // Multiple Connections in group 5
            { id: "11", head_ids: ["12", "13"], tail_ids: ["12", "13"] },
            { id: "12", head_ids: ["11", "13"], tail_ids: ["11", "13"] },
            { id: "13", head_ids: ["12", "11"], tail_ids: ["12", "11"] },
            // Self connections
            { id: "14", head_ids: ["14"], tail_ids: ["14"] },
            // Same as group 3 but with mix of head and tails
            { id: "15", head_ids: [], tail_ids: ["16"] },
            { id: "16", head_ids: [], tail_ids: [] },
            { id: "17", head_ids: ["16"], tail_ids: [] },
            { id: "15b", head_ids: [], tail_ids: [] },
            { id: "16b", head_ids: ["15b"], tail_ids: ["17b"] },
            { id: "17b", head_ids: [], tail_ids: [] },
        ]
        // 1
        // 2 --> 3  --> 4
        // 7 <-- 6  <-- 5
        // 8 --> 10 --> 9
        // ^---------/
        //
        //       13
        //       ^
        //       |
        // 11 <--+--> 12
        //
        // 14 -\
        //  ^--/
        //
        // 15 <-- 16 <-- 17
        // 15b <-- 16b <-- 17b

        const graph = helper_func__make_graph(items)
        return { items, graph }
    }


    function helper_func__branched_circular_multi_leaf ()
    {
        const items = [
            { id: "4", head_ids: ["2"], tail_ids: [] },
            { id: "2", head_ids: ["3"], tail_ids: [] },
            // Circular
            { id: "3", head_ids: ["2", "1", "4", "7"], tail_ids: [] },
            // Two heads
            { id: "1", head_ids: ["5", "6", "9"], tail_ids: [] },
            { id: "5", head_ids: [], tail_ids: [] },
            { id: "6", head_ids: [], tail_ids: [] },
            // Can be used later for "furthest_of_group"
            { id: "7", head_ids: ["8"], tail_ids: [] },
            { id: "8", head_ids: ["7"], tail_ids: [] },
            // two routes to leaf
            { id: "9", head_ids: ["5"], tail_ids: [] },
        ]
        //                         /--> 9 --+--> 5
        //  4 -> 2 -> 3 --------> 1 -------/
        //  ^    ^    |            \--------> 6
        //   \----\--/ \-> 7 -> 8
        //                 ^    |
        //                 \---/
        const graph = helper_func__make_graph(items)
        return { items, graph }
    }


    function helper_func__out_of_scope_node ()
    {
        const items = [
            { id: "1", head_ids: ["2"], tail_ids: ["3"] },
        ]
        //  (3) --> 1 --> (2)
        const graph = helper_func__make_graph(items)
        return { items, graph }
    }


    const s = helper_func__simple_graph()
    const m = helper_func__multi_group_graph()
    const scl = helper_func__simple_circular_and_leaf()
    const smg = helper_func__simple_multi_group_graph()
    const bcml = helper_func__branched_circular_multi_leaf()
    const oosn = helper_func__out_of_scope_node()


    describe("graph", () =>
    {
        helper_func__test_graph(s.graph, "0", { item: undefined, head_ids: [], tail_ids: [] })
        helper_func__test_graph(s.graph, "1", { item: s.items[0], head_ids: [], tail_ids: [] } )


        helper_func__test_graph(m.graph, "1",   { item: m.items[0],  head_ids: [], tail_ids: [] })
        helper_func__test_graph(m.graph, "2",   { item: m.items[1],  head_ids: ["3"], tail_ids: [] })
        helper_func__test_graph(m.graph, "3",   { item: m.items[2],  head_ids: ["4"], tail_ids: ["2"] })
        helper_func__test_graph(m.graph, "4",   { item: m.items[3],  head_ids: [], tail_ids: ["3"] })
        helper_func__test_graph(m.graph, "5",   { item: m.items[4],  head_ids: [], tail_ids: ["6"] })
        helper_func__test_graph(m.graph, "6",   { item: m.items[5],  head_ids: ["5"], tail_ids: ["7"] })
        helper_func__test_graph(m.graph, "7",   { item: m.items[6],  head_ids: ["6"], tail_ids: [] })
        helper_func__test_graph(m.graph, "8",   { item: m.items[7],  head_ids: ["10"], tail_ids: ["9"] })
        helper_func__test_graph(m.graph, "9",   { item: m.items[8],  head_ids: ["8"], tail_ids: ["10"] })
        helper_func__test_graph(m.graph, "10",  { item: m.items[9],  head_ids: ["9"], tail_ids: ["8"] })
        helper_func__test_graph(m.graph, "11",  { item: m.items[10], head_ids: ["12", "13"], tail_ids: ["12", "13"] })
        helper_func__test_graph(m.graph, "12",  { item: m.items[11], head_ids: ["11", "13"], tail_ids: ["11", "13"] })
        helper_func__test_graph(m.graph, "13",  { item: m.items[12], head_ids: ["11", "12"], tail_ids: ["11", "12"] })
        helper_func__test_graph(m.graph, "14",  { item: m.items[13], head_ids: ["14"], tail_ids: ["14"] })
        helper_func__test_graph(m.graph, "15",  { item: m.items[14], head_ids: [], tail_ids: ["16"] })
        helper_func__test_graph(m.graph, "16",  { item: m.items[15], head_ids: ["15"], tail_ids: ["17"] })
        helper_func__test_graph(m.graph, "17",  { item: m.items[16], head_ids: ["16"], tail_ids: [] })
        helper_func__test_graph(m.graph, "15b", { item: m.items[17], head_ids: [], tail_ids: ["16b"] })
        helper_func__test_graph(m.graph, "16b", { item: m.items[18], head_ids: ["15b"], tail_ids: ["17b"] })
        helper_func__test_graph(m.graph, "17b", { item: m.items[19], head_ids: ["16b"], tail_ids: [] })

        // make_graph should be able to gracefully handle edges going to nodes outside of scope
        helper_func__test_graph(oosn.graph, "1", { item: oosn.items[0], head_ids: [], tail_ids: [] })
    })


    describe("find_leaf_ids", () =>
    {
        test(find_leaf_ids(scl.graph), ["3", "4"])

        test(find_leaf_ids(smg.graph), ["2", "3", "5"])

        test(find_leaf_ids(bcml.graph), ["5", "6"])
    })


    describe("find_leaf_ids_for_id", () =>
    {
        test(find_leaf_ids_for_id(bcml.graph, "12"), [])
        test(find_leaf_ids_for_id(bcml.graph, "1"), ["5", "6"])
        test(find_leaf_ids_for_id(bcml.graph, "2"), ["5", "6"])
        test(find_leaf_ids_for_id(bcml.graph, "7"), [])
    })


    describe("find_leaf_group_ids", () =>
    {
        test(find_leaf_group_ids(s), [["1"]])

        test(find_leaf_group_ids(scl), [["3", "2", "1"], ["4", "1", "2"]])
    })


    describe("find_all_predecessor_ids", () =>
    {
        test(find_all_predecessor_ids(s.graph, "1"), [])

        test(find_all_predecessor_ids(scl.graph, "1"), ["2"])
        test(find_all_predecessor_ids(scl.graph, "2"), ["1"])
        test(find_all_predecessor_ids(scl.graph, "3"), ["2", "1"])
        test(find_all_predecessor_ids(scl.graph, "4"), ["1", "2"])

        test(find_all_predecessor_ids(bcml.graph, "2"), ["4", "3"])
        test(find_all_predecessor_ids(bcml.graph, "8"), ["7", "3", "2", "4"])
        test(find_all_predecessor_ids(bcml.graph, "5"), ["9", "1", "3", "2", "4"])
    })


})
