import { Box, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import { useMemo } from "preact/hooks"

import { Button } from "../../sharedf/Button"
import { EditableListEntry, EditableListEntryItemProps, ListItemCRUDRequiredC } from "./EditableListEntry"
import "./NewItemForm.css"



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
            <Dialog
                aria-labelledby="new_item_title"
                open={true}
                onClose={() => set_new_item(undefined)}
                // Confusing material-ui props: you have to set size to max width but not as you limit
                // it to the size you want.
                fullWidth={true} maxWidth="sm"
            >
                <DialogTitle id="new_item_title">New {item_descriptor}</DialogTitle>
                <DialogContent>
                    <EditableListEntry
                        item={new_item}
                        {...item_props}
                        expanded={true}
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
