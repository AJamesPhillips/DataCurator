import { Box } from "@material-ui/core"
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
        <Box mb={2}>
            <Button fullWidth={true} onClick={() => on_pointer_down_new_list_entry()}>
                {`New ${new_item_descriptor}`}
            </Button>
        </Box>
    )
}