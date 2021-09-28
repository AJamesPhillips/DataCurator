import { test } from "../shared/utils/test"



export function find_index_in_sorted_list <I> (sorted_list: I[], get_key: (item: I) => number, find_key: number): number
{
    let start = 0
    let end = sorted_list.length - 1

    while (start <= end) {
        let middle = Math.floor((start + end) / 2)

        const key = get_key(sorted_list[middle]!)

        if (key === find_key) {
            // found the key
            return middle
        } else if (key < find_key) {
            // continue searching to the right
            start = middle + 1
        } else {
            // search searching to the left
            end = middle - 1
        }
    }
    // key wasn't found
    return -1
}



export function find_nearest_index_in_sorted_list <I> (sorted_list: I[], get_key: (item: I) => number, find_key: number): { index: number, exact: boolean, bounds: "in" | "lower" | "higher" | "n/a" }
{
    let start = 0
    let end = sorted_list.length - 1

    while (start <= end) {
        let middle = Math.floor((start + end) / 2)

        const key = get_key(sorted_list[middle]!)

        if (key === find_key) {
            // found the key
            return { index: middle, exact: true, bounds: "in" }
        } else if (key < find_key) {
            // continue searching to the right
            start = middle + 1
        } else {
            // search searching to the left
            end = middle - 1
        }

        if (start > end)
        {
            const bounds = end === -1 ? "lower" : (start === sorted_list.length ? "higher" : "in")

            const index = bounds === "lower" ? -0.5 : (bounds === "higher" ? sorted_list.length - 0.5 : (
                key < find_key ? middle + 0.5 : middle - 0.5
            ))

            return { index, exact: false, bounds }
        }
    }

    return { index: -1, exact: false, bounds: "n/a" }
}



function run_tests ()
{
    console. log("running tests of find_index_in_sorted_list and find_nearest_index_in_sorted_list")

    let result = find_index_in_sorted_list([1, 2, 3, 4, 5, 6, 7, 8, 9], i => i, 3)
    test(result, 2)

    result = find_index_in_sorted_list([1, 2, 3, 4, 5, 6, 7, 8, 9], i => i, 3.5)
    test(result, -1)


    let result_nearest = find_nearest_index_in_sorted_list([1, 2, 3, 4, 5, 6, 7, 8, 9], i => i, 3)
    test(result_nearest, { index: 2, exact: true, bounds: "in" })

    result_nearest = find_nearest_index_in_sorted_list([1, 2, 3, 4, 5, 6, 7, 8, 9], i => i, 0)
    test(result_nearest, { index: -0.5, exact: false, bounds: "lower" })
    result_nearest = find_nearest_index_in_sorted_list([1, 2, 3, 4, 5, 6, 7, 8, 9], i => i, 1.5)
    test(result_nearest, { index: 0.5, exact: false, bounds: "in" })
    result_nearest = find_nearest_index_in_sorted_list([1, 2, 3, 4, 5, 6, 7, 8, 9], i => i, 2.5)
    test(result_nearest, { index: 1.5, exact: false, bounds: "in" })
    result_nearest = find_nearest_index_in_sorted_list([1, 2, 3, 4, 5, 6, 7, 8, 9], i => i, 3.5)
    test(result_nearest, { index: 2.5, exact: false, bounds: "in" })
    result_nearest = find_nearest_index_in_sorted_list([1, 2, 3, 4, 5, 6, 7, 8, 9], i => i, 9.5)
    test(result_nearest, { index: 8.5, exact: false, bounds: "higher" })
}

// run_tests()
