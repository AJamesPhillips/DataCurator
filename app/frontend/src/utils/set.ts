
// https://stackoverflow.com/a/31129384/539490
export function equal_sets <T> (as: Set<T>, bs: Set<T>)
{
    if (as.size !== bs.size) return false
    for (var a of as) if (!bs.has(a)) return false
    return true
}



export function toggle_item_in_set <E> (set: Set<E>, item: E): Set<E>
{
    set = new Set(set)

    if (set.has(item)) set.delete(item)
    else set.add(item)

    return set
}



export function ensure_item_in_set <E> (set: Set<E>, item: E): Set<E>
{
    if (set.has(item)) return set

    set = new Set(set)
    set.add(item)

    return set
}



export function ensure_item_not_in_set <E> (set: Set<E>, item: E): Set<E>
{
    if (!set.has(item)) return set

    set = new Set(set)
    set.delete(item)

    return set
}



export function set_union <E> (...sets: Set<E>[])
{
    let elements: E[] = []
    sets.forEach(set => elements = elements.concat(Array.from(set)))
    return new Set(elements)
}



export function set_difference <E> (set_a: Set<E>, set_b: Set<E>)
{
    const new_set_a = new Set(set_a)
    set_b.forEach(element => new_set_a.delete(element))
    return new_set_a.size === set_a.size ? set_a : new_set_a
}
