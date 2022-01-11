import { SortDirection, sort_list } from "../../shared/utils/sort"
import type { Base } from "../../shared/interfaces/base"
import { get_created_at_ms } from "../../shared/utils_datetime/utils_datetime"



interface GroupVersionsByIdReturn <U>
{
    latest: U[]
    previous_versions_by_id: {[id: string]: U[]}
}
export function group_versions_by_id <U extends Base> (items: U[]): GroupVersionsByIdReturn<U>
{
    const by_id: {[id: string]: U[]} = {}
    items.forEach(item =>
    {
        const sub_items = by_id[item.id] || []
        sub_items.push(item)
        by_id[item.id] = sub_items
    })

    const previous_versions_by_id: {[id: string]: U[]} = {}
    const latest: U[] = Object.values(by_id).map(sub_items =>
    {
        const sorted = sort_list(sub_items, get_created_at_ms, SortDirection.descending)

        const latest = sorted[0]!
        previous_versions_by_id[latest.id] = sorted.slice(1)

        return latest
    })

    return { latest, previous_versions_by_id }
}
