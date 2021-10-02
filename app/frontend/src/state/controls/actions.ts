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



const toggle_display_side_panel_type = "toggle_display_side_panel"

const toggle_display_side_panel = (): Action =>
{
    return { type: toggle_display_side_panel_type }
}

export const is_toggle_display_side_panel = (action: AnyAction): action is Action => {
    return action.type === toggle_display_side_panel_type
}



export const controls_actions = {
    toggle_linked_datetime_sliders,
    set_display_time_sliders,
    toggle_display_time_sliders,
    toggle_display_side_panel,
}
