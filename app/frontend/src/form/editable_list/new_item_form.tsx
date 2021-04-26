import { h } from "preact"

import { Button } from "../../sharedf/Button"
import type { EditableListProps } from "./EditableList"
import { EditableListEntry } from "./EditableListEntry"



interface NewItemForm<U> extends EditableListProps<U>
{
    new_item: U | undefined
    set_new_item: (new_item: U | undefined) => void
}

export function new_item_form <T> (props: NewItemForm<T>)
{
    const { new_item } = props

    if (!new_item) return null


    let cancelling = false

    return <div onClick={e => e.stopPropagation()}>
        <hr />
        <EditableListEntry
            item={new_item}
            {...props.item_top_props}
            expanded={true}
            disable_collapsable={true}
            on_change={item => {
                // Have to check if we are already canelling as various form elements will issue
                // on_change events when they blur.  And they will blur when the cancel button
                // is pressed.  If we do not return earlier then this function will recreate the
                // item that was just deleted when the cancel button set it to `undefined`.
                if (cancelling) return
                props.set_new_item(item)
            }}
        />

        <Button
            value={`Add ${props.item_descriptor}`}
            on_pointer_down={() => {
                props.set_new_item(undefined)
                props.update_items([...props.items, new_item])
            }}
        />
        <Button
            value="Cancel"
            extra_class_names="button_warning"
            on_pointer_down={() => {
                cancelling = true
                props.set_new_item(undefined)
            }}
        />
        <br />
        <hr />
    </div>
}
