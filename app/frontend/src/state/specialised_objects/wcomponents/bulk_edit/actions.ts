import type { Action, AnyAction } from "redux"

import type { WComponentCommon } from "../../../../wcomponent/interfaces/SpecialisedObjects"



interface BulkEditWComponentsProps
{
    wcomponent_ids: string[]
    change: Partial<WComponentCommon>
    remove_label_ids?: Set<string>
    add_label_ids?: Set<string>
}
export interface ActionBulkEditWComponents extends Action, BulkEditWComponentsProps {}

const bulk_edit_wcomponents_type = "bulk_edit_wcomponents"

const bulk_edit_wcomponents = (args: BulkEditWComponentsProps): ActionBulkEditWComponents =>
{
    return { type: bulk_edit_wcomponents_type, ...args }
}

export const is_bulk_edit_wcomponents = (action: AnyAction): action is ActionBulkEditWComponents => {
    return action.type === bulk_edit_wcomponents_type
}



export const bulk_editing_wcomponents_actions = {
    bulk_edit_wcomponents,
}
