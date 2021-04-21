import type { Store } from "redux"

import { render_object } from "../../objects/object_content"
import { ACTIONS } from "../actions"
import type { RootState } from "../State"


export function render_all_objects_and_update_store (store: Store)
{
    return () =>
    {
        const state = store.getState()

        const { objects } = render_all_objects(state)

        if (objects !== state.objects)
        {
            store.dispatch(ACTIONS.object.replace_all_objects_with_cache({ objects }))
        }
    }
}


export function render_all_objects (state: RootState): RootState
{
    let updated_one_or_more = false

    const updated_objects = state.objects.map(object => {
        if (object.is_rendered) return object

        updated_one_or_more = true

        const rendered = render_object({ object, state })
        return {
            ...object,
            rendered,
            is_rendered: true,
        }
    })

    if (!updated_one_or_more) return state

    return {
        ...state,
        objects: updated_objects,
    }
}
