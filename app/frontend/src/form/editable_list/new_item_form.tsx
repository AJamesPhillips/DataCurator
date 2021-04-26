import { h } from "preact"

import { Button } from "../../sharedf/Button"
import { EditableListEntry, EditableListEntryTopProps } from "./EditableListEntry"



export interface NewItemForm<U>
{
    new_item: U | undefined
    item_descriptor: string
    set_new_item: (new_item: U | undefined) => void
    add_item: () => void
    item_top_props: EditableListEntryTopProps<U>
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
                props.add_item()
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
