import { h } from "preact"
import { useState } from "preact/hooks"

import { ListHeader } from "./ListHeader"



export interface ListContentProps
{
    disable_partial_collapsed: boolean
    expanded_items: boolean
    expanded_item_rows: boolean
}


export interface ExpandableListProps {
    content: (props: ListContentProps) => h.JSX.Element | null
    items_count?: number
    items_descriptor?: string
    item_descriptor: string
    new_item_descriptor?: string
    on_click_new_item: () => void
    disable_collapsed?: boolean
    disable_partial_collapsed?: boolean
}


export function ExpandableList (props: ExpandableListProps)
{
    const expanded_initial_state = props.disable_collapsed
        ? (props.disable_partial_collapsed ? ExpandedListStates.expanded : ExpandedListStates.partial_expansion)
        : ExpandedListStates.collapsed
    const [expanded_items, set_expanded_items] = useState(expanded_initial_state)

    const expanded_item_rows = expanded_items === ExpandedListStates.expanded

    const {
        content,
        items_count,
        item_descriptor,
        items_descriptor = `${item_descriptor}s ${ items_count === undefined ? "" : `(${items_count})` }`,
        new_item_descriptor = item_descriptor,
        on_click_new_item,
        disable_partial_collapsed = false,
    } = props


    function toggle_expansion ()
    {
        let new_expansion = (expanded_items + 1) % 3
        if (props.disable_collapsed && new_expansion === ExpandedListStates.collapsed) ++new_expansion
        if (disable_partial_collapsed && new_expansion === ExpandedListStates.partial_expansion) ++new_expansion
        set_expanded_items(new_expansion)
    }


    return <div>
        <ListHeader
            items_descriptor={items_descriptor}
            new_item_descriptor={new_item_descriptor}
            on_click_header={toggle_expansion}
            hide_new_list_entry_button={false}
            on_pointer_down_new_list_entry={on_click_new_item}
        />

        {content({ disable_partial_collapsed, expanded_items: expanded_items > 0, expanded_item_rows })}
    </div>
}


enum ExpandedListStates {
    collapsed = 0,
    partial_expansion = 1,
    expanded = 2,
}
