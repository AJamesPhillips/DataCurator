
function Set_toJSON (key: string, value: any)
{
    if (value instanceof Set) return [...value].sort()
    if (value instanceof Array) return [...value].sort()

    return value
}


export function test <T> (got: T, expected: T, description="", sort_items=true)
{
    const str_got = sort_items ? JSON.stringify(got, Set_toJSON) : JSON.stringify(got)
    const str_expected = sort_items ? JSON.stringify(expected, Set_toJSON) : JSON.stringify(expected)

    const pass = str_got === str_expected
    if (pass) console. log ("pass  " + description)
    else console.error (`fail: "${str_got}" !== "${str_expected}"  ${description}`)
}
