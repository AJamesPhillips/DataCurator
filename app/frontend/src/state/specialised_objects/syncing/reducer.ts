import type { AnyAction } from "redux"

import { get_items_by_id } from "../../../shared/utils/get_items"
import type { RootState } from "../../State"
import { is_clear_from_mem_all_specialised_objects, is_replace_all_specialised_objects } from "./actions"



export const syncing_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_replace_all_specialised_objects(action))
    {
        const {
            wcomponents,
            knowledge_views,
        } = action.specialised_objects

        const wcomponents_by_id = get_items_by_id(wcomponents, "wcomponents")
        const knowledge_views_by_id = get_items_by_id(knowledge_views, "knowledge_views")

        state = {
            ...state,
            specialised_objects: {
                wcomponents_by_id,
                knowledge_views_by_id,
            }
        }
    }


    if (is_clear_from_mem_all_specialised_objects(action))
    {
        state = {
            ...state,
            specialised_objects: {
                wcomponents_by_id: {},
                knowledge_views_by_id: {},
            }
        }
    }


    return state
}
