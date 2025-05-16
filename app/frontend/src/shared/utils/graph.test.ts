import { describe, test } from "datacurator-core/utils/test"
import { alg, Graph } from "graphlib"
import {
    find_all_predecessor_ids,
    find_leaf_group_ids,
    find_leaf_ids,
    make_graph,
} from "./graph"


function find_leaf_ids_for_id (graph: Graph, node_id: string): string[]
{
    // May want to First split graph into components for optimisation?

    const leaf_ids = find_leaf_ids(graph)

    const connections = alg.dijkstra(graph, node_id)

    return leaf_ids.filter(leaf_id => connections[leaf_id]!.distance < Number.POSITIVE_INFINITY)
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
