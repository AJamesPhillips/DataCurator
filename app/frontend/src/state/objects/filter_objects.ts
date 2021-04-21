import { memoize } from "../../utils/memoize"
import type { ObjectsState, ObjectWithCache } from "../State"


export function factory_filter_objects_by_pattern_id_c (find_pattern_id: string)
{
    function _filter_objects_by_pattern_id (objects: ObjectsState)
    {
        return objects.filter(({ pattern_id }) => pattern_id === find_pattern_id)
    }

    const name = `_filter_objects_by_pattern_id_${find_pattern_id}`

    return memoize(_filter_objects_by_pattern_id, { cache_limit: 1, name })
}


export const get_object_by_id_c = memoize_get_object_by_id()

function memoize_get_object_by_id ()
{
    let cached_objects: ObjectsState
    let cache: { [object_id: string]: ObjectWithCache | undefined } = {}

    return (objects: ObjectsState, find_id: string) =>
    {
        if (cached_objects !== objects)
        {
            cache = {}
            cached_objects = objects
        }

        const cache_hit = cache[find_id]
        if (cache_hit) return cache_hit

        const result = objects.find(({ id }) => id === find_id)

        cache[find_id] = result

        return result
    }
}
