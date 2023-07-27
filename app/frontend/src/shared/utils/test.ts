import { stable_stringify } from "./stable_stringify"



export function test <T> (got: T, expected: T, description="", sort_items=true)
{
    const str_got = sort_items ? stable_stringify(got) : JSON.stringify(got)
    const str_expected = sort_items ? stable_stringify(expected) : JSON.stringify(expected)

    const pass = str_got === str_expected
    if (pass) console. log ("pass  " + description)
    else console.error (`fail: "${str_got}" !== "${str_expected}"  ${description}`)
}


export function describe (description: string, test_fn: () => undefined)
{
    console.log(description)
    test_fn()
}
