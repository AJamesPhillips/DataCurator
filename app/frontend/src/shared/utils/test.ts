/* eslint-disable @typescript-eslint/await-thenable */
import { stable_stringify } from "./stable_stringify"


interface TestRunStats
{
    describe_run: number
    describe_skipped: number
    test_run: number
    test_passed: number
    test_failed: string[]
    test_skipped: number
}

let _tests_stats: TestRunStats = {
    describe_run: 0,
    describe_skipped: 0,
    test_run: 0,
    test_passed: 0,
    test_failed: [],
    test_skipped: 0,
}

export const tests_stats = {
    get: () => _tests_stats,
    reset: () => {
        _tests_stats = {
            describe_run: 0,
            describe_skipped: 0,
            test_run: 0,
            test_passed: 0,
            test_failed: [],
            test_skipped: 0,
        }
    },
    print: () =>
    {
        const stats = _tests_stats

        console .log(`
describe: ${stats.describe_run + stats.describe_skipped}
tests: ${stats.test_run + stats.test_skipped}`)

    const skipped = stats.describe_skipped + stats.test_skipped
    console .log(`%cskipped: ${skipped}`,
    `color:${skipped ? "tan" : "LightGrey"};font-weight:bold;`)

    if (stats.test_failed.length)
    {
        console.error("failed: " + stats.test_failed.join("\nfailed: "))
    }

    console .log(`%cpassed: ${stats.test_passed}${stats.test_failed.length ? `\nfailed: ${stats.test_failed.length}` : ""}
    `, `color:${stats.test_failed.length ? "red" : "green"};font-weight:bold;`)
    }
}

interface TestFn
{
    <T>(got: T, expected: T, description?: string, sort_items?: boolean): void
}

interface Test extends TestFn
{
    skip: <T>(got: T, expected: T, description?: string, sort_items?: boolean) => void
}


const SORT_ITEMS_DEFAULT = true
const test_fn: TestFn = <T>(got: T, expected: T, description="", sort_items=SORT_ITEMS_DEFAULT) =>
{
    _tests_stats.test_run += 1

    const stringify_options = { render_undefined: true, sort_items }
    const str_got = stable_stringify(got, stringify_options)
    const str_expected = stable_stringify(expected, stringify_options)

    const pass = str_got === str_expected
    if (pass)
    {
        _tests_stats.test_passed += 1
        const description_first_line = description.split("\n").filter(l => l.trim())[0]
        console .log(`pass:  ${description_first_line}`)
    }
    else
    {
        const failure_description = `${description} "${str_got}" !== "${str_expected}"`
        log_test_failure<T>(failure_description, got, expected, sort_items)
    }
}


function log_test_failure<T>(failure_description: string, got: T, expected: T, sort_items=SORT_ITEMS_DEFAULT) {
    _tests_stats.test_failed.push(failure_description)
    console.error(`fail:  ${failure_description}`)

    const stringify_options = { render_undefined: true, sort_items }
    try {
        if (got?.constructor === Object && expected?.constructor === Object) {
            const keys = [...new Set([...Object.keys(got), ...Object.keys(expected)])]
            keys.sort()
            keys.forEach(key => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const [got_as_any, expected_as_any]: [any, any] = [got, expected]
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                const got_value = got_as_any[key]
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                const expected_value = expected_as_any[key]
                const str_got_value = stable_stringify(got_value, stringify_options)
                const str_expected_value = stable_stringify(expected_value, stringify_options)
                const pass = str_got_value === str_expected_value
                if (!pass) console.debug(`Test failure: different values for key "${key}", got: '${str_got_value}', but expected: '${str_expected_value}'`)
                else if (str_got_value === "undefined")
                {
                    // check the keys were both present
                    const key_in_got = key in got_as_any
                    const key_in_expected = key in expected_as_any
                    if (key_in_got !== key_in_expected) console.debug(`Test failure: key "${key}", got: ${key_in_got ? "present" : "not present"}, but expected: ${key_in_expected ? "present" : "not present"}`)
                }
            })
        }

    }
    catch (e) {
        console.debug("error in providing debugging for test failure", e)
    }
}


// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
export const test: Test = test_fn as any
test.skip = <T>(got: T, expected: T, description="", sort_items=SORT_ITEMS_DEFAULT) =>
{
    _tests_stats.test_skipped += 1
    console .warn("skipping  " + description)
}


type TestDescriptionFn = (() => void) | (() => Promise<void>)

interface DescribeFn
{
    (description: string, test_description_fn: () => void): () => void
    (description: string, test_description_fn: () => Promise<void>): Promise<() => Promise<void>>
    (description: string, test_description_fn: TestDescriptionFn): Promise<(() => void) | (() => Promise<void>)>
}

interface Describe extends DescribeFn
{
    skip: (description: string, test_description_fn: TestDescriptionFn) => () => void
    delay: (description: string, test_description_fn: TestDescriptionFn) => () => void
}


// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const describe_fn: DescribeFn = (async (description: string, test_description_fn: TestDescriptionFn) =>
{
    let run_tests

    if (is_async_function(test_description_fn))
    {
        run_tests = async () =>
        {
            _tests_stats.describe_run += 1
            console .group(description)
            try
            {
                await (test_description_fn())
            }
            catch (e)
            {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                log_test_failure(`error in test: ${e}`, null, null)
            }
            console .groupEnd()
        }

        await run_tests()
    }
    else
    {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        const test_description_fn1: () => void = test_description_fn
        run_tests = () =>
        {
            _tests_stats.describe_run += 1
            console .group(description)
            try
            {
                test_description_fn1()
            }
            catch (e)
            {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                log_test_failure(`error in test: ${e}`, null, null)
            }
            console .groupEnd()
        }

        run_tests()
    }

    return run_tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
export const describe: Describe = describe_fn as any
describe.skip = (description: string, test_description_fn: TestDescriptionFn) =>
{
    function skip_tests ()
    {
        _tests_stats.describe_skipped += 1
        console .warn("skipping  " + description)
    }

    return skip_tests
}

describe.delay = (description: string, test_description_fn: TestDescriptionFn) =>
{
    let run_tests

    if (is_async_function(test_description_fn))
    {
        run_tests = async () =>
        {
            _tests_stats.describe_run += 1
            console .group(description)
            try
            {
                await (test_description_fn())
            }
            catch (e)
            {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                log_test_failure(`error in test: ${e}`, null, null)
            }
            console .groupEnd()
        }
    }
    else
    {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        const test_description_fn1: () => void = test_description_fn
        run_tests = () =>
        {
            _tests_stats.describe_run += 1
            console .group(description)
            try
            {
                test_description_fn1()
            }
            catch (e)
            {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                log_test_failure(`error in test: ${e}`, null, null)
            }
            console .groupEnd()
        }
    }

    return run_tests
}


function is_async_function (func: TestDescriptionFn): func is () => Promise<void>
{
    return func.constructor.name === "AsyncFunction"
}
