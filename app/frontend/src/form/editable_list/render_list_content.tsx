import { h } from "preact"

import { upsert_entry, remove_index } from "../../utils/list"
import { EditableListEntry, EditableListEntryTopProps } from "./EditableListEntry"
import type { ListContentProps } from "./ExpandableList"



export interface RenderListContentProps <U>
{
    pre_list_content?: () => h.JSX.Element | null
    items: U[]
    get_id: (item: U) => string
    update_items: (items: U[]) => void

    item_top_props: EditableListEntryTopProps<U>

    item_descriptor: string
}

export function render_list_content <T> (own_props: RenderListContentProps<T>)
{
    const {
        pre_list_content,
        items,
        get_id,
        update_items,

        item_top_props,

        item_descriptor,
    } = own_props

    return (props: ListContentProps) =>
    {
        const {
            disable_partial_collapsed,
            expanded_items,
            expanded_item_rows,
        } = props

        return <div>
            {pre_list_content && pre_list_content()}

            <div
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
                        on_change={item => update_items(upsert_entry(items, item, p2 => get_id(item) === get_id(p2), item_descriptor)) }
                        delete_item={() => update_items(remove_index(items, index)) }
                    />
                </div>)}
            </div>
        </div>
    }
}
