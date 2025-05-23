import { WComponentType, wcomponent_types } from "../../wcomponent/interfaces/wcomponent_base"



export function get_items_by_id <I extends { id: string, title?: string }> (items: I[], description: string): { [id: string]: I }
{
    const map: { [id: string]: I } = {}

    items.forEach(item =>
    {
        if (map[item.id])
        {
            throw new Error(`Duplicate "${description}".id: "${map[item.id]}".  "${map[item.id]!.title}" and "${item.title}"`)
        }
        map[item.id] = item
    })

    return map
}



export function get_multiple_items_by_id <I extends { id: string, title?: string }> (items: I[]): { [id: string]: I[] }
{
    const map: { [id: string]: I[] } = {}

    items.forEach(item =>
    {
        map[item.id] = map[item.id] || []
        map[item.id]!.push(item)
    })

    return map
}



type IDsByType = { [t in WComponentType]: Set<string> }
export function get_item_ids_by_type <I extends { id: string, type: WComponentType }> (items: I[]): IDsByType
{
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const map: IDsByType = {} as any
    wcomponent_types.forEach(t => map[t] = new Set())

    items.forEach(item => map[item.type].add(item.id))

    return map
}
