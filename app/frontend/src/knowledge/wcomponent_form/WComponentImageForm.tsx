import { Box, FormControl, FormControlLabel } from "@material-ui/core"
import { h } from "preact"
import { DragDropUploader } from "../../form/DragDropUploader"
interface OwnProps
{

}


export function WComponentImageForm(props: OwnProps)
{

    return (
        <Box height={100} border={1} id="HIALSKDJALSKJDLAKSJD">
            <DragDropUploader
                label="Upload a cover image: "
                valid_file_types={['image/jpeg', 'image/jpg', 'image/png', 'image/gif']}
            />
        </Box>
    )
}
