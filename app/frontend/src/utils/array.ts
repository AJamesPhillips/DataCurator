import { test } from "../shared/utils/test"



export function intersperse <T, R> (array: T[], func: (entry_before: T, entry_after: T) => R): (T | R)[]
{
    const array_result: (T | R)[] = []

    for (let i = 0; i < array.length; ++i)
    {
        const element_before: T = array[i]!
        array_result.push(element_before)

        if (i >= (array.length - 1)) continue
        const element_after: T = array[i + 1]!

        array_result.push(func(element_before, element_after))
    }

    return array_result
}


function run_tests ()
{
    let result = intersperse<string, number>([], () => 0)
    test(result, [], "intersperse with no elements should be empty")


    result = intersperse<string, number>(["a"], () => 0)
    test(result, ["a"], "intersperse with 1 element should have no interspersed values")


    result = intersperse<string, number>(["a", "b", "c"], (e1, e2) => e1.charCodeAt(0) + e2.charCodeAt(0))
    test(result, ["a", 195, "b", 197, "c"], "intersperse with 3 elements should have interspersed values")
}


// run_tests()
