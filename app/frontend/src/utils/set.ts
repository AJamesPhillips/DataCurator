
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



export function set_union <E> (set1: Set<E>, set2: Set<E>)
{
    return new Set([
        ...Array.from(set1),
        ...Array.from(set2),
    ])
}
