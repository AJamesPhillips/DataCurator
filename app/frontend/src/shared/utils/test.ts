
function Set_toJSON (key: string, value: any)
{
    if (value instanceof Set) return [...value].sort()
    if (value instanceof Array) return [...value].sort()

    return value
}


export function test <T> (got: T, expected: T)
{
    const str_got = JSON.stringify(got, Set_toJSON)
    const str_expected = JSON.stringify(expected, Set_toJSON)

    const pass = str_got === str_expected
    if (pass) console. log ("pass")
    else console.error (`fail: "${str_got}" !== "${str_expected}"`)
}
