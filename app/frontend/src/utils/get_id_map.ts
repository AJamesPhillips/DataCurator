import { RootState, Item, Objekt, is_id_attribute, CoreObjectIdAttribute } from "../state/State"
import { is_object_id, is_statement_id, is_pattern_id } from "../shared/utils/ids"


export type ID_ITEM_MAP = {[id: string]: Item}

export function get_id_map (ids: string[], state: RootState, depth: number = 1): ID_ITEM_MAP
{
    let id_map: ID_ITEM_MAP = {}

    if (depth <= 0) return id_map

    const objects: Objekt[] = []
    ids.forEach(id_to_find =>
    {
        let item: Item | undefined
        if (is_object_id(id_to_find))
        {
            item = state.objects.find(({ id }) => id === id_to_find)
            if (item) objects.push(item as Objekt)
        }

        else if (is_statement_id(id_to_find))
        {
            item = state.statements.find(({ id }) => id === id_to_find)
        }

        else if (is_pattern_id(id_to_find))
        {
            item = state.patterns.find(({ id }) => id === id_to_find)
        }

        if (item) id_map[id_to_find] = item
    })

    const next_ids: string[] = get_ids_from_objects_attributes(objects)
    const deeper_id_map = get_id_map(next_ids, state, depth - 1)

    return {
        ...id_map,
        ...deeper_id_map,
    }
}


function get_ids_from_objects_attributes (objects: Objekt[])
{
    let all_ids: string[] = []
    objects.map(get_ids_from_object_attributes)
        .forEach(ids => all_ids = [...all_ids, ...ids])
    return all_ids
}


export function get_ids_from_object_attributes (object: Objekt)
{
    const id_attributes = object.attributes.filter(is_id_attribute) as CoreObjectIdAttribute[]
    const ids: string[] = id_attributes.map(({ id }) => id)
    return ids
}
