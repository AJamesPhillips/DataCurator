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



interface ActionSetDisplayCreatedAtTimeSlider extends Action
{
    display_created_at_time_slider: boolean
}

const set_display_created_at_time_slider_type = "set_display_created_at_time_slider"

const set_display_created_at_time_slider = (display_created_at_time_slider: boolean): ActionSetDisplayCreatedAtTimeSlider =>
{
    return { type: set_display_created_at_time_slider_type, display_created_at_time_slider }
}

export const is_set_display_created_at_time_slider = (action: AnyAction): action is ActionSetDisplayCreatedAtTimeSlider => {
    return action.type === set_display_created_at_time_slider_type
}



export const controls_actions = {
    toggle_linked_datetime_sliders,
    set_display_created_at_time_slider,
}
