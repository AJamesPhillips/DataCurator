import { h } from "preact"
import { useEffect, useState } from "preact/hooks"

import "./NewItemForm.css"
import { Button } from "../../sharedf/Button"
import { EditableListEntry, EditableListEntryTopProps } from "./EditableListEntry"



export interface NewItemForm<U>
{
    new_item: U | undefined
    set_new_item: (new_item: U | undefined) => void
    item_descriptor: string
    item_top_props: EditableListEntryTopProps<U>
    add_item: (new_item: U) => void
}



export function NewItemForm <T> (props: NewItemForm<T>)
{
    const { new_item, set_new_item, item_descriptor, item_top_props, add_item } = props

    const [adding_item, set_adding_item] = useState(false)

    // call add_item if necessary
    // Using effect because various form elements
    // will issue on_change events when they blur.  And they will blur when the
    // add (or cancel) buttons are pressed.  If we do not allow them to finish
    // then the item added will be a stale version.
    useEffect(() =>
    {
        if (!adding_item) return
        if (new_item) add_item(new_item)
        set_adding_item(false)
    }, [add_item, adding_item])


    if (!new_item) return null


    return <div className="new_item_form" onClick={e => e.stopPropagation()}>
        <hr />
        <EditableListEntry
            item={new_item}
            {...item_top_props}
            expanded={true}
            disable_collapsable={true}
            on_change={item => {
                set_new_item(item)
            }}
        />

        <Button
            extra_class_names="add_new_item"
            value={`Add ${item_descriptor}`}
            onClick={() =>
            {
                const input = document.activeElement as HTMLElement | HTMLInputElement | null
                if (input && input.blur) input.blur()
                set_adding_item(true)
            }}
        />
        <Button
            value="Cancel"
            extra_class_names="button_warning"
            onClick={() => {
                const input = document.activeElement as HTMLElement | HTMLInputElement | null
                if (input && input.blur) input.blur()
                set_new_item(undefined)
            }}
        />
        <br />
        <hr />
    </div>
}
