import { h } from "preact"
import { CustomisableEditableList } from "./CustomisableEditableList"

import type { ExpandableListProps } from "./ExpandableList"
import type { NewItemForm } from "./NewItemForm"
import { FactoryRenderListContentProps, factory_render_list_content } from "./render_list_content"



export type EditableListProps <U> = Omit<ExpandableListProps, "content" | "on_click_new_item">
& Omit<NewItemForm<U>, "new_item" | "set_new_item" | "add_item">
& FactoryRenderListContentProps<U>
& {
    prepare_new_item: () => U
}


export function EditableList <T> (props: EditableListProps<T>)
{

    const render_list_content = factory_render_list_content({
        items: props.items,
        get_id: props.get_id,
        update_items: props.update_items,

        item_top_props: props.item_top_props,

        item_descriptor: props.item_descriptor,
    })


    return <CustomisableEditableList
        {...props}
        content_renderer={render_list_content}
    />
}
