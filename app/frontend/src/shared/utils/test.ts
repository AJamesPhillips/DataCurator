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
    const str_got = sort_items ? stable_stringify(got) : JSON.stringify(got)
    const str_expected = sort_items ? stable_stringify(expected) : JSON.stringify(expected)

    const pass = str_got === str_expected
    if (pass) console .log("pass  " + description)
    else
    {
        console.error(`fail: "${str_got}" !== "${str_expected}"  ${description}`)
        try
        {
            if ((got as any)?.constructor === Object)
            {
                const keys = [...new Set([...Object.keys(got as any), ...Object.keys(expected as any)])]
                keys.sort()
                keys.forEach(key =>
                {
                    const got_value = (got as any)[key]
                    const expected_value = (expected as any)[key]
                    const str_got_value = sort_items ? stable_stringify(got_value) : JSON.stringify(got_value)
                    const str_expected_value = sort_items ? stable_stringify(expected_value) : JSON.stringify(expected_value)
                    const pass = str_got_value === str_expected_value
                    if (!pass) console.debug(`Test failure: different values for key "${key}", got: '${str_got_value}', expected: '${str_expected_value}'`)
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
