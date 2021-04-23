import { h } from "preact"
import { useState } from "preact/hooks"

import { Button } from "../../sharedf/Button"
import { remove_index, upsert_entry } from "../../utils/list"
import { EditableListEntry } from "./EditableListEntry"



interface OwnProps<U> {
    items: U[]
    item_descriptor: string
    new_item_descriptor?: string
    get_id: (item: U) => string
    get_created_at: (item: U) => Date
    get_custom_created_at?: (item: U) => Date | undefined
    get_summary: (item: U, on_change: (item: U) => void) => h.JSX.Element
    get_details: (item: U, on_change: (item: U) => void) => h.JSX.Element
    get_details2?: (item: U, on_change: (item: U) => void) => h.JSX.Element
    on_click_new_item: () => void
    update_items: (items: U[]) => void
    entries_extra_class_names?: string
    disable_collapsable?: boolean
}


export function List <T> (props: OwnProps<T>)
{
    const expanded_initial_state = props.disable_collapsable ? ExpandedListStates.expanded : ExpandedListStates.collapsed
    const [expanded_items, set_expanded_items] = useState(expanded_initial_state)

    const expanded_item_rows = expanded_items === ExpandedListStates.expanded

    const {
        items,
        item_descriptor,
        new_item_descriptor,
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
        if (props.disable_collapsable) return
        set_expanded_items((expanded_items + 1) % 3)
    }


    return <div onClick={toggle_expansion} style={{ cursor: props.disable_collapsable ? "default" : "pointer" }}>
        <Button
            value={`New ${new_item_descriptor || item_descriptor}`}
            extra_class_names="button_add_new_list_entry"
            on_pointer_down={e => {
                e.stopPropagation()
                on_click_new_item()
            }}
        />

        <div className="item_descriptor">{item_descriptor}s ({ items.length })</div>

        <div style={{ clear: "both" }}></div>

        <div
            style={{ display: expanded_items ? "" : "none", cursor: "initial" }}
            onClick={e => e.stopPropagation()}
        >
            {items.map((item, index) => [
                <hr className="entries_horizontal_dividers" />,
                <EditableListEntry
                    item={item}
                    get_created_at={get_created_at}
                    get_custom_created_at={get_custom_created_at}
                    get_summary={get_summary}
                    get_details={get_details}
                    get_details2={get_details2}
                    expanded={expanded_item_rows}
                    disable_collapsable={props.disable_collapsable}
                    on_change={item => update_items(upsert_entry(items, item, p2 => get_id(item) === get_id(p2), item_descriptor)) }
                    delete_item={() => update_items(remove_index(items, index)) }
                    extra_class_names={props.entries_extra_class_names}
                />,
            ])}
        </div>
    </div>
}


enum ExpandedListStates {
    collapsed = 0,
    partial_expansion = 1,
    expanded = 2,
}
