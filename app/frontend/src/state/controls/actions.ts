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



export const controls_actions = {
    toggle_linked_datetime_sliders,
}
