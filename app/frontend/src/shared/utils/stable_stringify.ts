// Derived from https://github.com/ljharb/json-stable-stringify/blob/main/index.js


interface Options
{
    comparison_function?: (a: {key: string, value: any}, b: {key: string, value: any}) => number
    space?: string | number
    cycles?: boolean
    replacer?: () => {}
    sort_items?: boolean
    render_undefined?: boolean
}

export function stable_stringify (obj: any, opts: Options = {})
{
    const sort_items = opts.sort_items ?? false
    const render_undefined = opts.render_undefined ?? false
    const space = typeof opts.space === "number" ? Array(opts.space + 1).join(" ") : (opts.space || "")

    const cycles = typeof opts.cycles === "boolean" ? opts.cycles : false

    const replacer = opts.replacer || ((key: string | number, value: any) =>
    {
        return is_date(value) ? value.toISOString() : (
            value instanceof Set ? Array.from(value).sort() : value
        )
    })

    const comparison_function_factory = opts.comparison_function && function (node: any)
    {
        return function (a: string, b: string)
        {
            return opts.comparison_function!(
                { key: a, value: node[a] },
                { key: b, value: node[b] }
            )
        }
    }


    const seen: string[] = []
    return (function stringify(parent: any, key: string | number, node: any, level: number): string | undefined
    {
        const indent = space ? "\n" + new Array(level + 1).join(space) : ""
        const colon_separator = space ? ": " : ":"

        // if (node && node.toJSON && typeof node.toJSON === "function")
        // {
        //     node = node.toJSON()
        // }

        node = replacer.call(parent, key, node)

        if (node === undefined)
        {
            return render_undefined ? "undefined" : undefined
        }

        if (typeof node !== "object" || node === null) {
            return JSON.stringify(node)
        }

        if (Array.isArray(node))
        {
            const out = []
            for (let i = 0; i < node.length; i++)
            {
                const item = stringify(node, i, node[i], level + 1) || JSON.stringify(null)
                out.push(indent + space + item)
            }
            return "[" + out.join(",") + indent + "]"
        }


        if (seen.indexOf(node) !== -1)
        {
            if (cycles) { return JSON.stringify("__cycle__") }
            throw new TypeError("Converting circular structure to JSON")
        }
        else
        {
            seen.push(node)
        }


        let keys = Object.keys(node)
        if (sort_items)
        {
            keys = keys.sort(comparison_function_factory && comparison_function_factory(node))
        }
        const out: string[] = []
        keys.forEach(key =>
        {
            const value = stringify(node, key, node[key], level + 1)

            if (!value)
            {
                return
            }

            const keyValue = JSON.stringify(key)
                    + colon_separator
                    + value

            out.push(indent + space + keyValue)
        })

        seen.splice(seen.indexOf(node), 1)
        return "{" + out.join(",") + indent + "}"

    }({ "": obj }, "", obj, 0))
}



function is_date (value: any): value is Date
{
    return Object.prototype.toString.call(value) === "[object Date]"
}
