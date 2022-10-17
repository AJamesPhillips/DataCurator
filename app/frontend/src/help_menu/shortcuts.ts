

export enum ActionCommands
{
    click = "click",
    drag = "drag",
}

export interface ShortcutProps
{
    shortcut: string[]
    outcome: string
}


type ShortcutIDs = "help"
    | "fit_view"
    | "toggle_present_edit"
    | "toggle_side"
    | "toggle_time"
    | "toggle_focused"
    | "toggle_animating"
    | "toggle_circular_connections"
    | "select_multiple"
    | "deselect_multiple"
    | "select_all"
    | "expand_select_forwards"
    | "expand_select_backwards"
    | "expand_select"
    | "decrease_select"
    | "select_interconnections"
    | "search"


export const shortcuts_map: {[id in ShortcutIDs]: ShortcutProps} = {
    help: { shortcut: ["?"], outcome: "Opens this help menu" },
    fit_view: { shortcut: ["space"], outcome: "Fit view to components / cycle between groups of components." },
    toggle_present_edit: { shortcut: ["Ctrl", "e"], outcome: "Toggle between presentation and editing modes" },
    toggle_side: { shortcut: ["Ctrl", "d", "s"], outcome: `Toggle showing side panel` },
    toggle_time: { shortcut: ["Ctrl", "d", "t"], outcome: `Toggle showing time sliders` },
    toggle_focused: { shortcut: ["Ctrl", "d", "f"], outcome: `Toggle "focused" mode on and off` },
    toggle_animating: { shortcut: ["Ctrl", "d", "a"], outcome: `Toggle animating connections` },
    toggle_circular_connections: { shortcut: ["Ctrl", "d", "c"], outcome: `Toggle showing connections as (more) circular` },
    select_multiple: { shortcut: ["Shift", ActionCommands.click, ActionCommands.drag], outcome: "Select multiple nodes" },
    deselect_multiple: { shortcut: ["Shift", "Ctrl", ActionCommands.click, ActionCommands.drag], outcome: "Deselect multiple nodes" },
    select_all: { shortcut: ["Ctrl", "a"], outcome: "Select all nodes on knowledge view" },
    expand_select_forwards: { shortcut: ["Ctrl", "s", "f"], outcome: "Expand selection towards effects (forwards)" },
    expand_select_backwards: { shortcut: ["Ctrl", "s", "c"], outcome: "Expand selection towards causes (backwards)" },
    expand_select: { shortcut: ["Ctrl", "s", "e"], outcome: "Expand selection" },
    decrease_select: { shortcut: ["Ctrl", "s", "d"], outcome: "Decrease selection (along non circular connections and nodes)" },
    select_interconnections: { shortcut: ["Ctrl", "s", "i"], outcome: "Select components inbetween (interconnections)" },
    search: { shortcut: ["Ctrl", "f"], outcome: "Open the search menu" },
}


export const shortcuts_list: ShortcutProps[] = [
    shortcuts_map.help,
    shortcuts_map.fit_view,
    shortcuts_map.toggle_present_edit,
    shortcuts_map.toggle_side,
    shortcuts_map.toggle_time,
    shortcuts_map.toggle_focused,
    shortcuts_map.toggle_animating,
    shortcuts_map.toggle_circular_connections,
    shortcuts_map.select_multiple,
    shortcuts_map.deselect_multiple,
    shortcuts_map.select_all,
    shortcuts_map.expand_select_forwards,
    shortcuts_map.expand_select_backwards,
    shortcuts_map.expand_select,
    shortcuts_map.decrease_select,
    shortcuts_map.select_interconnections,
    shortcuts_map.search,
]
