import type { AnyAction } from "redux"

import type { RootState } from "../../State"
import { get_items_by_id, get_item_ids_by_type } from "../../../shared/models/utils"
import { is_replace_all_specialised_objects } from "./actions"



export const syncing_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_replace_all_specialised_objects(action))
    {
        const {
            perceptions,
            wcomponents,
        } = action.specialised_objects

        const perceptions_by_id = get_items_by_id(perceptions, "perceptions")
        const wcomponents_by_id = get_items_by_id(wcomponents, "wcomponents")
        const wcomponent_ids_by_type = get_item_ids_by_type(wcomponents)

        state = {
            ...state,
            specialised_objects: {
                ...action.specialised_objects,
                perceptions_by_id,
                wcomponents_by_id,
                wcomponent_ids_by_type,
            }
        }
    }

    return state
}
