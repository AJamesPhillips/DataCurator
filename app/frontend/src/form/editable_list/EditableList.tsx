import { h } from "preact"
import { useState } from "preact/hooks"

import { Button } from "../../sharedf/Button"
import { EditableListEntry } from "./EditableListEntry"
import { List, ListProps } from "./List"



type OwnProps <U> = Omit<ListProps<U>, "on_click_new_item" | "pre_list_content"> &
{
    prepare_new_item: () => U
}

export function EditableList <T> (props: OwnProps<T>)
{
    const [new_item, set_new_item] = useState<T | undefined>(undefined)

    return <List
        {...props}
        pre_list_content={() => pre_list_content({ ...props, new_item, set_new_item })}
        on_click_new_item={() => {
            const item = props.prepare_new_item()
            set_new_item(item)
        }}
    />
}



interface PreListContentProps<U> extends OwnProps<U>
{
    new_item: U | undefined
    set_new_item: (new_item: U | undefined) => void
}

function pre_list_content <T> (props: PreListContentProps<T>)
{
    const { new_item } = props

    if (!new_item) return null


    let cancelling = false

    return <div onClick={e => e.stopPropagation()}>
        <hr />
        <EditableListEntry
            item={new_item}
            get_created_at={props.get_created_at}
            get_custom_created_at={props.get_custom_created_at}
            set_custom_created_at={props.set_custom_created_at}
            get_summary={props.get_summary}
            get_details={props.get_details}
            get_details2={props.get_details2}
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
            extra_class_names={props.entries_extra_class_names}
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
