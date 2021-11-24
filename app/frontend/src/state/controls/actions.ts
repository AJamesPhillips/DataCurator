import type { Action, AnyAction } from "redux"



interface ActionToggleLinkedDatetimeSliders extends Action {}

const toggle_linked_datetime_sliders_type = "toggle_linked_datetime_sliders"

const toggle_linked_datetime_sliders = (): ActionToggleLinkedDatetimeSliders =>
{
    return { type: toggle_linked_datetime_sliders_type }
}

export const is_toggle_linked_datetime_sliders = (action: AnyAction): action is ActionToggleLinkedDatetimeSliders => {
    return action.type === toggle_linked_datetime_sliders_type
}



interface ActionSetDisplayTimeSliders extends Action
{
    display_time_sliders: boolean
}

const set_display_time_sliders_type = "set_display_time_sliders"

const set_display_time_sliders = (display_time_sliders: boolean): ActionSetDisplayTimeSliders =>
{
    return { type: set_display_time_sliders_type, display_time_sliders }
}

export const is_set_display_time_sliders = (action: AnyAction): action is ActionSetDisplayTimeSliders => {
    return action.type === set_display_time_sliders_type
}



const toggle_display_time_sliders_type = "toggle_display_time_sliders"

const toggle_display_time_sliders = (): Action =>
{
    return { type: toggle_display_time_sliders_type }
}

export const is_toggle_display_time_sliders = (action: AnyAction): action is Action => {
    return action.type === toggle_display_time_sliders_type
}



interface ActionSetOrToggleDisplaySidePanel extends Action
{
    display_side_panel?: boolean
}

const set_or_toggle_display_side_panel_type = "set_or_toggle_display_side_panel"

const set_or_toggle_display_side_panel = (display_side_panel?: boolean): ActionSetOrToggleDisplaySidePanel =>
{
    // Protect against events being passed into this function from material-ui onClick handlers with
    // incorrect typings
    if (typeof display_side_panel !== "boolean") display_side_panel = undefined

    return { type: set_or_toggle_display_side_panel_type, display_side_panel }
}

export const is_set_or_toggle_display_side_panel = (action: AnyAction): action is ActionSetOrToggleDisplaySidePanel => {
    return action.type === set_or_toggle_display_side_panel_type
}



interface ActionSetOrToggleDisplaySelectStorage extends Action
{
    display_select_storage?: boolean
}

const set_or_toggle_display_select_storage_type = "set_or_toggle_display_select_storage"

const set_or_toggle_display_select_storage = (display_select_storage?: boolean): ActionSetOrToggleDisplaySelectStorage =>
{
    // Protect against events being passed into this function from material-ui onClick handlers with
    // incorrect typings
    if (typeof display_select_storage !== "boolean") display_select_storage = undefined

    return { type: set_or_toggle_display_select_storage_type, display_select_storage }
}

export const is_set_or_toggle_display_select_storage = (action: AnyAction): action is ActionSetOrToggleDisplaySelectStorage => {
    return action.type === set_or_toggle_display_select_storage_type
}



export const controls_actions = {
    toggle_linked_datetime_sliders,
    set_display_time_sliders,
    toggle_display_time_sliders,
    set_or_toggle_display_side_panel,
    set_or_toggle_display_select_storage,
}
