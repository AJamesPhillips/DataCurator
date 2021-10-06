import { h } from "preact"

import { EditableListEntry, EditableListEntryItemProps, ListItemCRUDRequiredU } from "./EditableListEntry"
import type { ExpandableListContentProps } from "./interfaces"



export interface FactoryRenderListContentProps <U, Crud>
{
    items: U[]
    get_id: (item: U) => string

    item_props: EditableListEntryItemProps<U, Crud>

    debug_item_descriptor?: string
}

export function factory_render_list_content <U, Crud extends ListItemCRUDRequiredU<U>> (own_props: FactoryRenderListContentProps<U, Crud>)
{
    const {
        items,
        get_id,

        item_props,

        debug_item_descriptor = "",
    } = own_props


    const render_list_content = (list_content_props: ExpandableListContentProps) =>
    {
        const {
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

                    {...item_props}

                    expanded={expanded_item_rows}
                />
            </div>)}
        </div>
    }

    return render_list_content
}
