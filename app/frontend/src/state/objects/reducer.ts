import type { Action, AnyAction } from "redux"
import { replace_element } from "../../utils/list"

import { is_update_pattern } from "../pattern_actions"
import type {
    RootState,
    Objekt,
    Pattern,
    CoreObject,
    ObjectWithCache,
} from "../State"
import {
    is_add_object,
    is_delete_object,
    is_update_object,
    is_replace_all_core_objects,
    is_replace_all_objects_with_cache,
    is_upsert_objects,
} from "./actions"
import { merge_pattern_into_core_object } from "./objects"


export const objects_reducer = (state: RootState, action: AnyAction): RootState =>
{
    let bust_object_render_caches = false

    if (is_add_object(action))
    {
        const new_object = action_to_object_with_cache(action, state.patterns)
        bust_object_render_caches = true

        state = {
            ...state,
            objects: [...state.objects, new_object]
        }
    }


    if (is_delete_object(action))
    {
        state = {
            ...state,
            objects: state.objects.filter(({ id }) => id !== action.id)
        }
        bust_object_render_caches = true
    }


    if (is_update_object(action))
    {
        const object_exists = !!state.objects.find(({ id }) => id === action.id)

        if (!object_exists)
        {
            console.error(`No object for id: "${action.id}"`)
            return state
        }

        const replacement_object = action_to_object_with_cache(action, state.patterns)
        bust_object_render_caches = true

        const objects = replace_element(state.objects, replacement_object, ({ id }) => id === action.id)

        state = {
            ...state,
            objects,
        }
    }


    if (is_replace_all_core_objects(action))
    {
        const new_objects: ObjectWithCache[] = []
        action.objects.forEach(core_object => {
            const new_object = add_cache(merge_pattern_into_core_object({
                object: core_object,
                patterns: state.patterns,
            }))
            new_objects.push(new_object)
        })
        // `add_cache` function already set all objects to have id_rendered: false
        // bust_object_render_caches = true

        state = {
            ...state,
            objects: new_objects,
        }
    }


    if (is_replace_all_objects_with_cache(action))
    {
        state = {
            ...state,
            objects: action.objects,
        }
        // For now `is_replace_all_objects_with_cache` is how we set the rendered
        // value of all objects So we can not bust the cache here
        bust_object_render_caches = false
    }


    if (is_upsert_objects(action))
    {
        const existing_ids: Set<string> = new Set()
        state.objects.forEach(o => {
            if (existing_ids.has(o.id)) console.error(`Duplicate objects found for id: ${o.id}`)
            existing_ids.add(o.id)
        })

        const object_ids_to_update: {[id: string]: ObjectWithCache} = {}
        const objects_to_insert: ObjectWithCache[] = []

        action.objects.forEach(core_object => {
            const new_object = add_cache(merge_pattern_into_core_object({
                object: core_object,
                patterns: state.patterns,
            }))

            if (existing_ids.has(new_object.id)) object_ids_to_update[new_object.id] = new_object
            else objects_to_insert.push(new_object)
        })
        bust_object_render_caches = true

        const objects: ObjectWithCache[] = state.objects.map(o => {
            if (object_ids_to_update.hasOwnProperty(o.id))
            {
                o = {
                    ...o,
                    ...object_ids_to_update[o.id],
                }
            }

            return o
        }).concat(objects_to_insert)

        state = {
            ...state,
            objects,
        }
    }


    if (is_update_pattern(action))
    {
        bust_object_render_caches = true
    }


    if (bust_object_render_caches)
    {
        // bust the cache
        state = {
            ...state,
            objects: state.objects.map(o => {
                const object: ObjectWithCache = {
                    ...o,
                    rendered: "",
                    is_rendered: false,
                }
                return object
            })
        }
    }


    return state
}



function add_cache (object: Objekt): ObjectWithCache
{
    return {
        ...object,
        rendered: "",
        is_rendered: false,
    }
}


function action_to_object_with_cache (action: CoreObject & Action, patterns: Pattern[]): ObjectWithCache
{
    const core_object: CoreObject = { ...action }
    delete (core_object as any).type
    const object: ObjectWithCache = add_cache(merge_pattern_into_core_object({
        object: core_object,
        patterns: patterns,
    }))

    return object
}
