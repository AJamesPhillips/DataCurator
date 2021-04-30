import { h } from "preact"

import { Button } from "../../sharedf/Button"



interface OwnProps {
    new_item_descriptor: string
    on_pointer_down_new_list_entry: () => void
}


export function ListHeaderAddButton (props: OwnProps)
{
    const {
        new_item_descriptor,
        on_pointer_down_new_list_entry
    } = props


    return <Button
        value={`New ${new_item_descriptor}`}
        extra_class_names="button_add_new_list_entry"
        on_pointer_down={e => {
            e.stopPropagation()
            on_pointer_down_new_list_entry()
        }}
    />
}
