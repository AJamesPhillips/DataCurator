import { h } from "preact"
import { useState } from "preact/hooks"

import type { EditableListEntryTopProps } from "./EditableListEntry"
import { ExpandableListWithAddButton } from "./ExpandableListWithAddButton"
import type { ExpandableListContentProps } from "./interfaces"
import { NewItemForm } from "./NewItemForm"
import { factory_render_list_content } from "./render_list_content"



interface EditableListProps <U>
{
    items: U[]
    item_descriptor: string
    get_id: (item: U) => string
    item_top_props: EditableListEntryTopProps<U>
    prepare_new_item: () => U
    update_items: (items: U[]) => void
    disable_collapsed?: boolean
    disable_partial_collapsed?: boolean
}


export function EditableList <T> (props: EditableListProps<T>)
{
    const [new_item, set_new_item] = useState<T | undefined>(undefined)

    const render_list_content = factory_render_list_content({
        items: props.items,
        get_id: props.get_id,
        update_items: props.update_items,

        item_top_props: props.item_top_props,

        debug_item_descriptor: props.item_descriptor,
    })

    return <ExpandableListWithAddButton
        items_count={props.items.length}

        on_click_new_item={() => {
            const item = props.prepare_new_item()
            set_new_item(item)
        }}

        content={(list_content_props: ExpandableListContentProps) =>
        {
            return <div>
                <NewItemForm
                    new_item={new_item}
                    set_new_item={set_new_item}
                    item_top_props={props.item_top_props}
                    item_descriptor={props.item_descriptor}
                    add_item={new_item =>
                    {
                        props.update_items([...props.items, new_item])
                        set_new_item(undefined)
                    }}
                />

                {render_list_content(list_content_props)}
            </div>
        }}

        {...props}
    />
}
