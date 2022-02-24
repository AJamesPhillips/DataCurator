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

    return (
        <div>
            <Button
                fullWidth={true}
                onClick={e =>
                {
                    e.stopImmediatePropagation() // otherwise the list of items will change its expanded state
                    on_pointer_down_new_list_entry()
                }}
            >
                {`New ${new_item_descriptor}`}
            </Button>
        </div>
    )
}