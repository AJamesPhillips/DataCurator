import { h } from "preact"
import { useState } from "preact/hooks"

import { ExpandableList, ExpandableListProps, ListContentProps } from "./ExpandableList"
import { NewItemForm } from "./NewItemForm"
import { FactoryRenderListContentProps, factory_render_list_content } from "./render_list_content"



export type EditableListProps <U> = Omit<ExpandableListProps, "content" | "on_click_new_item">
& Omit<NewItemForm<U>, "new_item" | "set_new_item" | "add_item">
& FactoryRenderListContentProps<U>
& {
    prepare_new_item: () => U
}


export function EditableList <T> (props: EditableListProps<T>)
{
    const [new_item, set_new_item] = useState<T | undefined>(undefined)

    const render_list_content = factory_render_list_content({
        items: props.items,
        get_id: props.get_id,
        update_items: props.update_items,

        item_top_props: props.item_top_props,

        item_descriptor: props.item_descriptor,
    })


    return <ExpandableList
        on_click_new_item={() => {
            const item = props.prepare_new_item()
            set_new_item(item)
        }}

        content={(list_content_props: ListContentProps) =>
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
