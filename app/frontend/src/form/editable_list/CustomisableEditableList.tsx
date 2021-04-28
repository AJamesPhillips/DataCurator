import { h } from "preact"
import { useState } from "preact/hooks"

import { ExpandableList, ExpandableListProps, ListContentProps } from "./ExpandableList"
import { NewItemForm } from "./NewItemForm"



export type CustomisableEditableListProps <U> = Omit<ExpandableListProps, "content" | "on_click_new_item">
& Omit<NewItemForm<U>, "new_item" | "set_new_item" | "add_item">
& {
    prepare_new_item: () => U
    content_renderer: (list_content_props: ListContentProps) => h.JSX.Element | null
    items: U[]
    update_items: (items: U[]) => void
}


export function CustomisableEditableList <T> (props: CustomisableEditableListProps<T>)
{
    const [new_item, set_new_item] = useState<T | undefined>(undefined)

    return <ExpandableList
        items_count={props.items.length}

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

                {props.content_renderer(list_content_props)}
            </div>
        }}

        {...props}
    />
}
