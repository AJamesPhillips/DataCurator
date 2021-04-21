
export function test <T> (got: T, expected: T)
{
    if (JSON.stringify(got) === JSON.stringify(expected)) console.log ("pass")
    else console.error (`fail: "${JSON.stringify(got)}" !== "${JSON.stringify(expected)}"`)
}
