import type { Action, AnyAction } from "redux"
import type {
    ConnectionLocationType,
    ConnectionTerminalType,
} from "../../../../shared/models/interfaces/SpecialisedObjects"



interface ClickedWComponentProps
{
    id: string
}
interface ActionClickedWComponent extends Action, ClickedWComponentProps {}

const clicked_wcomponent_type = "clicked_wcomponent"

const clicked_wcomponent = (args: ClickedWComponentProps): ActionClickedWComponent =>
{
    return { type: clicked_wcomponent_type, ...args }
}

export const is_clicked_wcomponent = (action: AnyAction): action is ActionClickedWComponent => {
    return action.type === clicked_wcomponent_type
}



interface ClearSelectedWComponentsProps {}
interface ActionClearSelectedWComponents extends Action, ClearSelectedWComponentsProps {}

const clear_selected_wcomponents_type = "clear_selected_wcomponents"

const clear_selected_wcomponents = (args: ClearSelectedWComponentsProps): ActionClearSelectedWComponents =>
{
    return { type: clear_selected_wcomponents_type, ...args }
}

export const is_clear_selected_wcomponents = (action: AnyAction): action is ActionClearSelectedWComponents => {
    return action.type === clear_selected_wcomponents_type
}



interface SetInterceptWComponentClickToEditLinkProps
{
    edit_wcomponent_id: string | undefined
    connection_terminal_type: ConnectionTerminalType
}
interface ActionSetInterceptWComponentClickToEditLink extends Action, SetInterceptWComponentClickToEditLinkProps {}

const set_intercept_wcomponent_click_to_edit_link_type = "set_intercept_wcomponent_click_to_edit_link"

const set_intercept_wcomponent_click_to_edit_link = (args: SetInterceptWComponentClickToEditLinkProps): ActionSetInterceptWComponentClickToEditLink =>
{
    return { type: set_intercept_wcomponent_click_to_edit_link_type, ...args }
}

export const is_set_intercept_wcomponent_click_to_edit_link = (action: AnyAction): action is ActionSetInterceptWComponentClickToEditLink => {
    return action.type === set_intercept_wcomponent_click_to_edit_link_type
}



interface PointerUpDownOnConnectionTerminalProps
{
    wcomponent_id: string
    connection_location: ConnectionLocationType
    up_down: "up" | "down"
}
interface ActionPointerUpDownOnConnectionTerminal extends Action, PointerUpDownOnConnectionTerminalProps {}

const pointerupdown_on_connection_terminal_type = "pointerupdown_on_connection_terminal"

const pointerupdown_on_connection_terminal = (args: PointerUpDownOnConnectionTerminalProps): ActionPointerUpDownOnConnectionTerminal =>
{
    return { type: pointerupdown_on_connection_terminal_type, ...args }
}

const is_pointerupdown_on_connection_terminal = (action: AnyAction): action is ActionPointerUpDownOnConnectionTerminal => {
    return action.type === pointerupdown_on_connection_terminal_type
}
export const is_pointerup_on_connection_terminal = (action: AnyAction): action is ActionPointerUpDownOnConnectionTerminal => {
    return is_pointerupdown_on_connection_terminal(action) && action.up_down === "up"
}
export const is_pointerdown_on_connection_terminal = (action: AnyAction): action is ActionPointerUpDownOnConnectionTerminal => {
    return is_pointerupdown_on_connection_terminal(action) && action.up_down === "down"
}



interface ClearPointerUpDownOnConnectionTerminalProps {}
interface ActionClearPointerUpDownOnConnectionTerminal extends Action, ClearPointerUpDownOnConnectionTerminalProps {}

const clear_pointerupdown_on_connection_terminal_type = "clear_pointerupdown_on_connection_terminal"

const clear_pointerupdown_on_connection_terminal = (args: ClearPointerUpDownOnConnectionTerminalProps): ActionClearPointerUpDownOnConnectionTerminal =>
{
    return { type: clear_pointerupdown_on_connection_terminal_type, ...args }
}

export const is_clear_pointerupdown_on_connection_terminal = (action: AnyAction): action is ActionClearPointerUpDownOnConnectionTerminal => {
    return action.type === clear_pointerupdown_on_connection_terminal_type
}



export const selecting_actions = {
    clicked_wcomponent,
    clear_selected_wcomponents,
    set_intercept_wcomponent_click_to_edit_link,
    pointerupdown_on_connection_terminal,
    clear_pointerupdown_on_connection_terminal,
}
