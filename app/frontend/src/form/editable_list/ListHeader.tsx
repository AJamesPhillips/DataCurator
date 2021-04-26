import { h } from "preact"

import { Button } from "../../sharedf/Button"



interface OwnProps {
    items_descriptor: string
    new_item_descriptor: string
    on_click_header?: () => void
    hide_new_list_entry_button: boolean
    on_pointer_down_new_list_entry: () => void
}


export function ListHeader (props: OwnProps)
{
    const {
        items_descriptor,
        new_item_descriptor,
        on_click_header,
        hide_new_list_entry_button,
        on_pointer_down_new_list_entry
    } = props


    return <div onClick={on_click_header} style={{ cursor: on_click_header ? "pointer" : "default" }}>
        <Button
            is_hidden={hide_new_list_entry_button}
            value={`New ${new_item_descriptor}`}
            extra_class_names="button_add_new_list_entry"
            on_pointer_down={e => {
                e.stopPropagation()
                on_pointer_down_new_list_entry()
            }}
        />

        <div className="item_descriptors">{items_descriptor}</div>

        <div style={{ clear: "both" }}></div>
    </div>
}
