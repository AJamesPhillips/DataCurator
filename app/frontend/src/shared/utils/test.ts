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
    if (pass) console. log ("pass  " + description)
    else console.error (`fail: "${str_got}" !== "${str_expected}"  ${description}`)
}

export const test: Test = test_fn as any
test.skip = <T>(got: T, expected: T, description="", sort_items=true) =>
{
    console. log ("skipping  " + description)
}


export function describe (description: string, test_fn: () => void)
{
    console.log(description)
    test_fn()
}
