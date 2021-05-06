import { h } from "preact"

import { upsert_entry, remove_from_list_by_predicate } from "../../utils/list"
import { EditableListEntry, EditableListEntryTopProps } from "./EditableListEntry"
import type { ExpandableListContentProps } from "./interfaces"



export interface FactoryRenderListContentProps <U>
{
    items: U[]
    get_id: (item: U) => string
    update_items: (items: U[]) => void

    item_top_props: EditableListEntryTopProps<U>

    debug_item_descriptor?: string
}

export function factory_render_list_content <T> (own_props: FactoryRenderListContentProps<T>)
{
    const {
        items,
        get_id,
        update_items,

        item_top_props,

        debug_item_descriptor = "",
    } = own_props


    const render_list_content = (list_content_props: ExpandableListContentProps) =>
    {
        const {
            disable_partial_collapsed,
            expanded_items,
            expanded_item_rows,
        } = list_content_props

        return <div
            style={{ display: expanded_items ? "" : "none", cursor: "initial" }}
            onClick={e => e.stopPropagation()}
        >
            {items.map((item, index) => <div key={get_id(item)}>
                <hr className="entries_horizontal_dividers" />
                <EditableListEntry
                    item={item}

                    {...item_top_props}

                    expanded={expanded_item_rows}
                    disable_collapsable={disable_partial_collapsed}
                    on_change={item =>
                    {
                        const predicate_by_id = (other: T) => get_id(item) === get_id(other)
                        const new_items = upsert_entry(items, item, predicate_by_id, debug_item_descriptor)
                        update_items(new_items)
                    }}
                    delete_item={() =>
                    {
                        const predicate_by_id = (other: T) => get_id(item) === get_id(other)
                        const new_items = remove_from_list_by_predicate(items, predicate_by_id)
                        update_items(new_items)
                    }}
                />
            </div>)}
        </div>
    }

    return render_list_content
}
