
export function replace_element<T> (existing: T[], replacement: T, predicate: (element: T) => boolean): T[]
{
    const index = existing.findIndex(predicate)

    if (index < 0)
    {
        console.error(`Can not find element by predicate: ${predicate.toString()}`)
        return existing
    }

    return [...existing.slice(0, index), replacement, ...existing.slice(index + 1)]
}



export function upsert_entry<I> (existing: I[], new_item: I, predicate: (element: I) => boolean, debug_item_descriptor: string)
{
    let matched_index = -1
    const matches = existing.filter((item, index) =>
    {
        const match = predicate(item)
        if (match) matched_index = index

        return match
    })

    if (matches.length > 1)
    {
        throw new Error(`During upsert_entry multiple (${matches.length}) "${debug_item_descriptor}" items matching predicate: "${predicate.toString()}"`)
    }

    let new_list = existing

    if (matches.length === 1)
    {
        // Compare new and matched item to see if different
        if (matches[0] !== new_item)
        {
            new_list = [
                ...existing.slice(0, matched_index),
                new_item,
                ...existing.slice(matched_index + 1)
            ]
        }
    }
    else
    {
        new_list = [...existing, new_item]
    }

    return new_list
}



export function remove_index <I> (list: I[], index: number): I[]
{
    return list.slice(0, index).concat(list.slice(index + 1))
}



export function remove_from_list_by_predicate <I> (list: I[], predicate: (i: I) => boolean): I[]
{
    const filtered = list.filter(i => !predicate(i))

    return filtered.length === list.length ? list : filtered
}



export function toggle_item_in_list <I> (list: I[], item: I, predicate?: (i: I) => boolean): I[]
{
    const pred = predicate || ((i: I) => i === item)

    const new_list = list.filter(i => !pred(i))

    if (new_list.length === list.length) new_list.push(item)

    return new_list
}



export function unique_list <I> (items: I[]): I[]
{
    const contained = new Set<I>()
    const filtered: I[] = []

    items.forEach(item =>
    {
        if (contained.has(item)) return
        contained.add(item)
        filtered.push(item)
    })

    return filtered.length === items.length ? items : filtered
}
