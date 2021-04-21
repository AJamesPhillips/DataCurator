

interface KeyedItem <E>
{
    item: E
    key_value: number
}


type Direction = "ascending" | "descending"


export function sort_list <E> (items: E[], key: (item: E, index: number) => number, direction: Direction): E[]
{
    const sort_function = get_sort_function<E>(direction)

    return items.map((item, index) => ({ item, key_value: key(item, index) }))
        .sort(sort_function)
        .map(({ item }) => item)
}


function get_sort_function <E> (direction: Direction)
{
    const change1 = direction === "ascending" ? -1 : 1
    const change2 = direction === "ascending" ? 1 : -1

    return (i1: KeyedItem<E>, i2: KeyedItem<E>) => i1.key_value < i2.key_value
        ? change1
        : (i1.key_value > i2.key_value
            ? change2
            : 0)
}