import type { Action, AnyAction } from "redux"

import { TimeResolution } from "datacurator-core/interfaces/datetime"

import type { CertaintyFormattingTypes, ValidityFilterTypes } from "./state"



const toggle_consumption_formatting_type = "toggle_consumption_formatting"

const toggle_consumption_formatting = (): Action =>
{
    return { type: toggle_consumption_formatting_type }
}

export const is_toggle_consumption_formatting = (action: AnyAction): action is Action => {
    return action.type === toggle_consumption_formatting_type
}



interface ActionSetOrToggleFocusedMode extends Action {
    focused_mode: boolean | undefined
}

const set_or_toggle_focused_mode_type = "set_or_toggle_focused_mode"

const set_or_toggle_focused_mode = (focused_mode?: boolean): ActionSetOrToggleFocusedMode =>
{
    return { type: set_or_toggle_focused_mode_type, focused_mode }
}

export const is_set_or_toggle_focused_mode = (action: AnyAction): action is ActionSetOrToggleFocusedMode => {
    return action.type === set_or_toggle_focused_mode_type
}



interface SetTimeResolutionArgs
{
    time_resolution: TimeResolution
}
interface ActionSetTimeResolution extends Action, SetTimeResolutionArgs {}

const set_time_resolution_type = "set_time_resolution"

const set_time_resolution = (args: SetTimeResolutionArgs): ActionSetTimeResolution =>
{
    return { type: set_time_resolution_type, ...args }
}

export const is_set_time_resolution = (action: AnyAction): action is ActionSetTimeResolution => {
    return action.type === set_time_resolution_type
}



interface SetValidityFilterArgs
{
    validity_filter: ValidityFilterTypes
}
interface ActionSetValidityFilter extends Action, SetValidityFilterArgs {}

const set_validity_filter_type = "set_validity_filter"

const set_validity_filter = (args: SetValidityFilterArgs): ActionSetValidityFilter =>
{
    return { type: set_validity_filter_type, ...args }
}

export const is_set_validity_filter = (action: AnyAction): action is ActionSetValidityFilter => {
    return action.type === set_validity_filter_type
}



interface SetCertaintyFormattingArgs
{
    certainty_formatting: CertaintyFormattingTypes
}
interface ActionSetCertaintyFormatting extends Action, SetCertaintyFormattingArgs {}

const set_certainty_formatting_type = "set_certainty_formatting"

const set_certainty_formatting = (args: SetCertaintyFormattingArgs): ActionSetCertaintyFormatting =>
{
    return { type: set_certainty_formatting_type, ...args }
}

export const is_set_certainty_formatting = (action: AnyAction): action is ActionSetCertaintyFormatting => {
    return action.type === set_certainty_formatting_type
}



interface SetDisplayBySimulatedTimeArgs
{
    display_by_simulated_time: boolean
}
interface ActionSetDisplayBySimulatedTime extends Action, SetDisplayBySimulatedTimeArgs {}

const set_display_by_simulated_time_type = "set_display_by_simulated_time"

const set_display_by_simulated_time = (display_by_simulated_time: boolean): ActionSetDisplayBySimulatedTime =>
{
    return { type: set_display_by_simulated_time_type, display_by_simulated_time }
}

export const is_set_display_by_simulated_time = (action: AnyAction): action is ActionSetDisplayBySimulatedTime => {
    return action.type === set_display_by_simulated_time_type
}



interface SetDisplayTimeMarksArgs
{
    display_time_marks: boolean
}
interface ActionSetDisplayTimeMarks extends Action, SetDisplayTimeMarksArgs {}

const set_display_time_marks_type = "set_display_time_marks"

const set_display_time_marks = (display_time_marks: boolean): ActionSetDisplayTimeMarks =>
{
    return { type: set_display_time_marks_type, display_time_marks }
}

export const is_set_display_time_marks = (action: AnyAction): action is ActionSetDisplayTimeMarks => {
    return action.type === set_display_time_marks_type
}



interface SetOrToggleAnimateCausalLinksArgs
{
    animate_connections: boolean | undefined
}
interface ActionSetOrToggleAnimateCausalLinks extends Action, SetOrToggleAnimateCausalLinksArgs {}

const set_or_toggle_animate_connections_type = "set_or_toggle_animate_connections"

const set_or_toggle_animate_connections = (animate_connections?: boolean): ActionSetOrToggleAnimateCausalLinks =>
{
    return { type: set_or_toggle_animate_connections_type, animate_connections }
}

export const is_set_or_toggle_animate_connections = (action: AnyAction): action is ActionSetOrToggleAnimateCausalLinks => {
    return action.type === set_or_toggle_animate_connections_type
}



// Probably need a better name than "circular links".  This is a display option to change the
// destination of links from just being to the left and from the right to being the closest points
// to each other
interface SetOrToggleCircularLinksArgs
{
    circular_links: boolean | undefined
}
interface ActionSetOrToggleCircularLinks extends Action, SetOrToggleCircularLinksArgs {}

const set_or_toggle_circular_links_type = "set_or_toggle_circular_links"

const set_or_toggle_circular_links = (circular_links?: boolean): ActionSetOrToggleCircularLinks =>
{
    return { type: set_or_toggle_circular_links_type, circular_links }
}

export const is_set_or_toggle_circular_links = (action: AnyAction): action is ActionSetOrToggleCircularLinks => {
    return action.type === set_or_toggle_circular_links_type
}



interface SetShowHelpMenuArgs
{
    show: boolean
}
interface ActionSetShowHelpMenu extends Action, SetShowHelpMenuArgs {}

const set_show_help_menu_type = "set_show_help_menu"

const set_show_help_menu = (args: SetShowHelpMenuArgs): ActionSetShowHelpMenu =>
{
    return { type: set_show_help_menu_type, ...args }
}

export const is_set_show_help_menu = (action: AnyAction): action is ActionSetShowHelpMenu => {
    return action.type === set_show_help_menu_type
}



interface SetOrToggleShowLargeGridArgs
{
    show_large_grid: boolean | undefined
}
interface ActionSetOrToggleShowLargeGrid extends Action, SetOrToggleShowLargeGridArgs {}

const set_or_toggle_show_large_grid_type = "set_or_toggle_show_large_grid"

const set_or_toggle_show_large_grid = (show_large_grid?: boolean): ActionSetOrToggleShowLargeGrid =>
{
    return { type: set_or_toggle_show_large_grid_type, show_large_grid }
}

export const is_set_or_toggle_show_large_grid = (action: AnyAction): action is ActionSetOrToggleShowLargeGrid => {
    return action.type === set_or_toggle_show_large_grid_type
}


export const display_actions = {
    toggle_consumption_formatting,
    set_or_toggle_focused_mode,
    set_time_resolution,
    set_validity_filter,
    set_certainty_formatting,
    set_display_by_simulated_time,
    set_display_time_marks,
    set_or_toggle_animate_connections,
    set_or_toggle_circular_links,
    set_show_help_menu,
    set_or_toggle_show_large_grid,
}
