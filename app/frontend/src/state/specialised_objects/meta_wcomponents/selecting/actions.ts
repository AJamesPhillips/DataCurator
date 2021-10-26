import type { Action, AnyAction } from "redux"
import type {
    ConnectionTerminalType,
} from "../../../../wcomponent/interfaces/SpecialisedObjects"



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



interface ActionClearSelectedWComponents extends Action {}

const clear_selected_wcomponents_type = "clear_selected_wcomponents"

const clear_selected_wcomponents = (args: {}): ActionClearSelectedWComponents =>
{
    return { type: clear_selected_wcomponents_type, ...args }
}

export const is_clear_selected_wcomponents = (action: AnyAction): action is ActionClearSelectedWComponents => {
    return action.type === clear_selected_wcomponents_type
}



interface SetSelectedWcomponentsProps
{
    ids: string[]
}
export interface ActionSetSelectedWcomponents extends Action, SetSelectedWcomponentsProps {}

const set_selected_wcomponents_type = "set_selected_wcomponents"

const set_selected_wcomponents = (args: SetSelectedWcomponentsProps): ActionSetSelectedWcomponents =>
{
    return { type: set_selected_wcomponents_type, ...args }
}

export const is_set_selected_wcomponents = (action: AnyAction): action is ActionSetSelectedWcomponents => {
    return action.type === set_selected_wcomponents_type
}



interface PointerUpDownOnConnectionTerminalProps
{
    wcomponent_id: string
    terminal_type: ConnectionTerminalType
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



interface SetWComponentIdsToMoveProps
{
    wcomponent_ids_to_move: Set<string>
}
interface ActionSetWComponentIdsToMove extends Action, SetWComponentIdsToMoveProps {}

const set_wcomponent_ids_to_move_type = "set_wcomponent_ids_to_move"

const set_wcomponent_ids_to_move = (args: SetWComponentIdsToMoveProps): ActionSetWComponentIdsToMove =>
{
    return { type: set_wcomponent_ids_to_move_type, ...args }
}

export const is_set_wcomponent_ids_to_move = (action: AnyAction): action is ActionSetWComponentIdsToMove => {
    return action.type === set_wcomponent_ids_to_move_type
}



export const selecting_actions = {
    clicked_wcomponent,
    clear_selected_wcomponents,
    set_selected_wcomponents,
    pointerupdown_on_connection_terminal,
    clear_pointerupdown_on_connection_terminal,
    set_wcomponent_ids_to_move,
}
