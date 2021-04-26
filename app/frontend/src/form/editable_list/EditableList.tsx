import { h } from "preact"
import { useState } from "preact/hooks"

import { ExpandableList, ExpandableListProps } from "./ExpandableList"
import { new_item_form } from "./new_item_form"
import { RenderListContentProps, render_list_content } from "./render_list_content"



export type EditableListProps <U> = Omit<ExpandableListProps, "items_count" | "content" | "on_click_new_item">
& RenderListContentProps<U>
& {
    prepare_new_item: () => U
}


export function EditableList <T> (props: EditableListProps<T>)
{
    const [new_item, set_new_item] = useState<T | undefined>(undefined)

    return <ExpandableList
        {...props}
        items_count={props.items.length}
        content={render_list_content({
            pre_list_content: () => new_item_form({ ...props, new_item, set_new_item }),
            ...props,
        })}
        on_click_new_item={() => {
            const item = props.prepare_new_item()
            set_new_item(item)
        }}
    />
}
