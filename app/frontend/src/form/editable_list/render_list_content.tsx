import { h } from "preact"

import { upsert_entry, remove_index } from "../../utils/list"
import { EditableListEntry, EditableListEntryTopProps } from "./EditableListEntry"
import type { ListContentProps } from "./ExpandableList"



export interface FactoryRenderListContentProps <U>
{
    items: U[]
    get_id: (item: U) => string
    update_items: (items: U[]) => void

    item_top_props: EditableListEntryTopProps<U>

    item_descriptor: string
    extra_class_names?: string
}

export function factory_render_list_content <T> (own_props: FactoryRenderListContentProps<T>)
{
    const {
        items,
        get_id,
        update_items,

        item_top_props,

        item_descriptor,
        extra_class_names,
    } = own_props


    const render_list_content = (list_content_props: ListContentProps) =>
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
                    on_change={item => update_items(upsert_entry(items, item, p2 => get_id(item) === get_id(p2), item_descriptor)) }
                    delete_item={() => update_items(remove_index(items, index)) }
                    extra_class_names={extra_class_names}
                />
            </div>)}
        </div>
    }

    return render_list_content
}
