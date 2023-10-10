import { describe, test } from "../shared/utils/test"
import { index_is_in_bounds, insert_element_at_index, swap_elements } from "./list"



export const run_list_function_tests = describe("list functions", () =>
{
    describe("index_is_in_bounds", () =>
    {
        test(index_is_in_bounds([], 0), false, "empty list, any number")
        test(index_is_in_bounds(["A"], -1), false, "list with one element, index -1")
        test(index_is_in_bounds(["A"], 0), true, "list with one element, index 0")
        test(index_is_in_bounds(["A"], 1), false, "list with one element, index 1")
        test(index_is_in_bounds(["A", "B"], 1), true, "list with two elements, index 1")
        test(index_is_in_bounds(["A", "B"], 2), false, "list with two elements, index 2")
    })



    describe("swap_elements", () =>
    {
        test(swap_elements([], 0, 0), [], "empty list, any indices, should be noop")
        test(swap_elements(["A", "B"], -1, 0), ["A", "B"], "invalid first index of -1, should be noop")
        test(swap_elements(["A", "B"], 2, 0), ["A", "B"], "invalid first index of 2, should be noop")
        test(swap_elements(["A", "B"], 0, -1), ["A", "B"], "invalid second index of -1, should be noop")
        test(swap_elements(["A", "B"], 0, 2), ["A", "B"], "invalid second index of 2, should be noop")

        test(swap_elements(["A", "B"], 0, 1), ["B", "A"], "should swap")
        test(swap_elements(["A", "B"], 1, 0), ["B", "A"], "should swap")

        test(swap_elements(["A", "B"], 1, 1), ["A", "B"], "should handle noop")
    })



    describe("insert_element_at_index", () =>
    {
        test(insert_element_at_index([], "A", 0), ["A"], "insertion works at index 0")
        test(insert_element_at_index([], "A", -2), ["A"], "insertion works at any negative index")
        test(insert_element_at_index([], "A", 2), ["A"], "insertion works at any positive index")

        test(insert_element_at_index(["A", "B", "C"], "D", 0), ["D", "A", "B", "C"], "insertion works at index 0")
        test(insert_element_at_index(["A", "B", "C"], "D", -2), ["D", "A", "B", "C"], "insertion works at any negative index")
        test(insert_element_at_index(["A", "B", "C"], "D", 2), ["A", "B", "D", "C"], "insertion works at an positive index that is in the list")
        test(insert_element_at_index(["A", "B", "C"], "D", 3), ["A", "B", "C", "D"], "insertion works at an positive index that is the length of the list")
        test(insert_element_at_index(["A", "B", "C"], "D", 4), ["A", "B", "C", "D"], "insertion works at any positive index that is > list length")
    })

}, false)
