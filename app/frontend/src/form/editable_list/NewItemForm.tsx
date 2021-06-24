import { h } from "preact"
import { useEffect, useState } from "preact/hooks"

import "./NewItemForm.css"
import { Button } from "../../sharedf/Button"
import { EditableListEntry, EditableListEntryTopProps } from "./EditableListEntry"
import { Box, Dialog, DialogTitle } from "@material-ui/core"

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
    return (
        <Box>
            <Dialog  aria-labelledby="simple-dialog-title" open={true} onClose={() => set_new_item(undefined)}>
                <DialogTitle id="simple-dialog-title">New {item_descriptor}</DialogTitle>
                <Box>
                    <EditableListEntry
                        item={new_item}
                        {...item_top_props}
                        expanded={true}
                        disable_collapsable={true}
                        on_change={item => {
                            set_new_item(item)
                        }}
                    />
                </Box>
				<Box p={2} display="flex" justifyContent="space-between">
					<Button onClick={() =>set_adding_item(true)}>
						{`Add ${item_descriptor}`}
					</Button>
					<Button onClick={() => set_new_item(undefined)}>
						Cancel
					</Button>
				</Box>
            </Dialog>
        </Box>
    )
}
