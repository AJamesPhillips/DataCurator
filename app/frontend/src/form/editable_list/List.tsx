import { h } from "preact"
import { useState } from "preact/hooks"

import { remove_index, upsert_entry } from "../../utils/list"
import { EditableListEntry } from "./EditableListEntry"
import { ListHeader } from "./ListHeader"



export interface ListProps<U> {
    items: U[]
    items_descriptor?: string
    item_descriptor: string
    new_item_descriptor?: string
    pre_list_content?: () => h.JSX.Element | null
    get_id: (item: U) => string
    get_created_at: (item: U) => Date
    get_custom_created_at?: (item: U) => Date | undefined
    set_custom_created_at?: (item: U, new_custom_created_at: Date | undefined) => U
    get_summary: (item: U, on_change: (item: U) => void) => h.JSX.Element
    get_details: (item: U, on_change: (item: U) => void) => h.JSX.Element
    get_details2?: (item: U, on_change: (item: U) => void) => h.JSX.Element
    on_click_new_item: () => void
    update_items: (items: U[]) => void
    entries_extra_class_names?: string
    disable_collapsed?: boolean
    disable_partial_collapsed?: boolean
}


export function List <T> (props: ListProps<T>)
{
    const expanded_initial_state = props.disable_collapsed
        ? (props.disable_partial_collapsed ? ExpandedListStates.expanded : ExpandedListStates.partial_expansion)
        : ExpandedListStates.collapsed
    const [expanded_items, set_expanded_items] = useState(expanded_initial_state)

    const expanded_item_rows = expanded_items === ExpandedListStates.expanded

    const {
        items,
        item_descriptor,
        items_descriptor = `${item_descriptor}s (${ items.length })`,
        new_item_descriptor = item_descriptor,
        pre_list_content,
        get_id,
        get_created_at,
        get_custom_created_at,
        get_summary,
        get_details,
        get_details2,
        on_click_new_item,
        update_items,
    } = props


    function toggle_expansion ()
    {
        let new_expansion = (expanded_items + 1) % 3
        if (props.disable_collapsed && new_expansion === ExpandedListStates.collapsed) ++new_expansion
        if (props.disable_partial_collapsed && new_expansion === ExpandedListStates.partial_expansion) ++new_expansion
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

        {pre_list_content && pre_list_content()}

        <div
            style={{ display: expanded_items ? "" : "none", cursor: "initial" }}
            onClick={e => e.stopPropagation()}
        >
            {items.map((item, index) => <div key={get_id(item)}>
                <hr className="entries_horizontal_dividers" />
                <EditableListEntry
                    item={item}
                    get_created_at={get_created_at}
                    get_custom_created_at={get_custom_created_at}
                    get_summary={get_summary}
                    get_details={get_details}
                    get_details2={get_details2}
                    expanded={expanded_item_rows}
                    disable_collapsable={props.disable_partial_collapsed}
                    on_change={item => update_items(upsert_entry(items, item, p2 => get_id(item) === get_id(p2), item_descriptor)) }
                    delete_item={() => update_items(remove_index(items, index)) }
                    extra_class_names={props.entries_extra_class_names}
                />
            </div>)}
        </div>
    </div>
}


enum ExpandedListStates {
    collapsed = 0,
    partial_expansion = 1,
    expanded = 2,
}
