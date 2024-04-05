import { stable_stringify } from "./stable_stringify"
import { describe, test } from "./test"


export const test_stable_stringify = describe.delay("stable_stringify", () =>
{
    let result: string | undefined = ""
    result = stable_stringify({ a: 1, b: 2, c: 3 })
    test(result, '{"a":1,"b":2,"c":3}', "regular object")

    result = stable_stringify({ c: 3, b: 2, a: 1 })
    test(result, '{"c":3,"b":2,"a":1}', "regular object with keys in reverse order remains unchanged by default")

    result = stable_stringify({ c: 3, b: 2, a: 1 }, { sort_items: true })
    test(result, '{"a":1,"b":2,"c":3}', "regular object with keys in reverse order are sorted if requested")

    result = stable_stringify({ a: { b: { c: 3 } } })
    test(result, '{"a":{"b":{"c":3}}}', "nested object")

    result = stable_stringify({ a: undefined })
    test(result, '{}', "object with undefined not rendered by default")

    result = stable_stringify({ a: undefined }, { render_undefined: true })
    test(result, '{"a":undefined}', "object with undefined rendered when render_undefined is true")
})
