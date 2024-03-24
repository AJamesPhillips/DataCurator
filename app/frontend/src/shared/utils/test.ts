import { stable_stringify } from "./stable_stringify"


interface TestFn
{
    <T>(got: T, expected: T, description?: string, sort_items?: boolean): void
}

interface Test extends TestFn
{
    skip: <T>(got: T, expected: T, description?: string, sort_items?: boolean) => void
}


const test_fn: TestFn = <T>(got: T, expected: T, description="", sort_items=true) =>
{
    const stringify_options = { render_undefined: true, sort_items }
    const str_got = stable_stringify(got, stringify_options)
    const str_expected = stable_stringify(expected, stringify_options)

    const pass = str_got === str_expected
    if (pass) console .log("pass  " + description)
    else
    {
        console.error(`fail: "${str_got}" !== "${str_expected}"  ${description}`)
        try
        {
            if (got?.constructor === Object)
            {
                const keys = [...new Set([...Object.keys(got), ...Object.keys(expected as any)])]
                keys.sort()
                keys.forEach(key =>
                {
                    const got_value = (got as any)[key]
                    const expected_value = (expected as any)[key]
                    const str_got_value = stable_stringify(got_value, stringify_options)
                    const str_expected_value = stable_stringify(expected_value, stringify_options)
                    let pass = str_got_value === str_expected_value
                    if (!pass) console.debug(`Test failure: different values for key "${key}", got: '${str_got_value}', but expected: '${str_expected_value}'`)
                    else if (str_got_value === "undefined")
                    {
                        // check the keys were both present
                        const key_in_got = key in (got as any)
                        const key_in_expected = key in (expected as any)
                        if (key_in_got !== key_in_expected) console.debug(`Test failure: key "${key}", got: ${key_in_got ? "present" : "not present"}, but expected: ${key_in_expected ? "present" : "not present"}`)
                    }
                })
            }

        } catch (e) {
            console.debug("error in providing debugging for test failure", e)
        }
    }
}

export const test: Test = test_fn as any
test.skip = <T>(got: T, expected: T, description="", sort_items=true) =>
{
    console .warn("skipping  " + description)
}


interface DescribeFn
{
    (description: string, test_fn: () => void, run_immediately?: boolean): () => void
}

interface Describe extends DescribeFn
{
    skip: (description: string, test_fn: () => void, run_immediately?: boolean) => () => void
    immediate: (description: string, test_fn: () => void, run_immediately?: boolean) => () => void
}


const describe_fn: DescribeFn = (description: string, test_fn: () => void, run_immediately = true) =>
{
    function run_tests ()
    {
        console .group(description)
        test_fn()
        console .groupEnd()
    }

    if (run_immediately) run_tests()

    return run_tests
}

export const describe: Describe = describe_fn as any
describe.skip = (description: string, test_fn: () => void, run_immediately = true) =>
{
    function skip_tests ()
    {
        console .warn("skipping  " + description)
    }

    if (run_immediately) skip_tests()

    return skip_tests
}

describe.immediate = (description: string, test_fn: () => void, run_immediately = true) =>
{
    function run_tests ()
    {
        console .group(description)
        test_fn()
        console .groupEnd()
    }

    run_tests()

    return run_tests
}
