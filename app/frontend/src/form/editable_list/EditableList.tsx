import { h } from "preact"
import { useState } from "preact/hooks"

import { Button } from "../../sharedf/Button"
import { remove_index, upsert_entry } from "../../utils/list"
import { EditableListEntry } from "./EditableListEntry"



interface OwnProps<U> {
    items: U[]
    item_descriptor: string
    get_id: (item: U) => string
    get_created_at: (item: U) => Date
    get_custom_created_at?: (item: U) => Date | undefined
    set_custom_created_at?: (item: U, new_custom_created_at: Date | undefined) => U
    get_summary: (item: U, on_change: (item: U) => void, editing_new_item: boolean) => h.JSX.Element
    get_details: (item: U, on_change: (item: U) => void, editing_new_item: boolean) => h.JSX.Element
    get_details2?: (item: U, on_change: (item: U) => void, editing_new_item: boolean) => h.JSX.Element
    prepare_new_item: () => U
    update_items: (items: U[]) => void
    entries_extra_class_names?: string
    disable_collapsed?: boolean
    disable_partial_collapsed?: boolean
}


export function EditableList <T> (props: OwnProps<T>)
{
    const expanded_initial_state = props.disable_collapsed
        ? (props.disable_partial_collapsed ? ExpandedListStates.expanded : ExpandedListStates.partial_expansion)
        : ExpandedListStates.collapsed

    const [expanded_items, set_expanded_items] = useState(expanded_initial_state)
    const [new_item, set_new_item] = useState<T | undefined>(undefined)

    const expanded_item_rows = expanded_items === ExpandedListStates.expanded

    const {
        items,
        item_descriptor,
        get_id,
        get_created_at,
        get_custom_created_at,
        set_custom_created_at,
        get_summary,
        get_details,
        get_details2,
        prepare_new_item,
        update_items,
    } = props


    function toggle_expansion ()
    {
        let new_expansion = (expanded_items + 1) % 3
        if (props.disable_collapsed && new_expansion === ExpandedListStates.collapsed) ++new_expansion
        if (props.disable_partial_collapsed && new_expansion === ExpandedListStates.partial_expansion) ++new_expansion
        set_expanded_items(new_expansion)
    }


    function make_new_item ()
    {
        const new_item = prepare_new_item()
        set_new_item(new_item)
    }


    const disabled_collapsable = props.disable_collapsed && props.disable_partial_collapsed


    return <div onClick={toggle_expansion} style={{ cursor: disabled_collapsable ? "default" : "pointer" }}>
        <Button
            is_hidden={!!new_item}
            value={`New ${item_descriptor}`}
            extra_class_names="button_add_new_list_entry"
            on_click={e => {
                e.stopPropagation()
                make_new_item()
            }}
        />

        <div className="item_descriptor">{item_descriptor}s ({ items.length })</div>

        <div style={{ clear: "both" }}></div>

        {/* TODO see if it's useful / easy to rework this functionality into the List component */}
        {new_item && <div onClick={e => e.stopPropagation()}>
            <hr />
            <EditableListEntry
                item={new_item}
                get_created_at={get_created_at}
                get_custom_created_at={get_custom_created_at}
                set_custom_created_at={set_custom_created_at}
                get_summary={get_summary}
                get_details={get_details}
                get_details2={get_details2}
                expanded={true}
                disable_collapsable={disabled_collapsable}
                editing_new_item={true}
                on_change={item => set_new_item(item) }
                extra_class_names={props.entries_extra_class_names}
            />

            <Button
                value={`Add ${item_descriptor}`}
                on_click={() => {
                    set_new_item(undefined)
                    update_items([...items, new_item])
                }}
            />
            <Button
                value="Cancel"
                extra_class_names="button_warning"
                on_click={() => set_new_item(undefined)}
            />
            <br />
            <hr />
        </div>}

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
                    set_custom_created_at={set_custom_created_at}
                    get_summary={get_summary}
                    get_details={get_details}
                    get_details2={get_details2}
                    expanded={expanded_item_rows}
                    disable_collapsable={disabled_collapsable}
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
