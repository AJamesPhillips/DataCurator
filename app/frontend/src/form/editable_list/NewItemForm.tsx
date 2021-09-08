import { h } from "preact"
import { useMemo } from "preact/hooks"

import "./NewItemForm.css"
import { Button } from "../../sharedf/Button"
import { EditableListEntry, EditableListEntryItemProps, ListItemCRUDRequiredC } from "./EditableListEntry"
import { Box, Dialog, DialogActions, DialogContent, DialogTitle } from "@material-ui/core"



export interface NewItemFormProps<U, Crud>
{
    new_item: U | undefined
    set_new_item: (new_item: U | undefined) => void
    item_descriptor: string
    item_props: EditableListEntryItemProps<U, Crud>
}



export function NewItemForm <T, Crud extends ListItemCRUDRequiredC<T>> (props: NewItemFormProps<T, Crud>)
{
    const { new_item, set_new_item, item_descriptor, item_props } = props
    const { crud } = item_props


    const modified_crud = useMemo(() => ({ ...crud, update_item: set_new_item }), [crud, set_new_item])


    if (!new_item) return null

    return (
        <Box>
            <Dialog  aria-labelledby="new_item_title" open={true} onClose={() => set_new_item(undefined)}>
                <DialogTitle id="new_item_title">New {item_descriptor}</DialogTitle>
                <DialogContent>
                    <EditableListEntry
                        item={new_item}
                        {...item_props}
                        expanded={true}
                        disable_collapsable={true}
                        crud={modified_crud}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() =>
                    {
                        // Defensive in case any of the form input elements onBlur handlers have not fired yet
                        setTimeout(() => crud.create_item(new_item), 0)
                    }}>
                        Add {item_descriptor}
                    </Button>
                    <Button onClick={() => set_new_item(undefined)}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
