import { h } from "preact"

import "./MainArea.scss"
import { MainContentControls } from "./MainContentControls"
import { Box } from "@material-ui/core"



interface OwnProps {
    main_content: h.JSX.Element
}

export function MainArea (props: OwnProps)
{
    return (
        <Box id="main_area" display="flex" flexDirection="column" flexGrow={1} flexShrink={1}>
            <Box id="main_content" flexGrow={1} flexShrink={1} display="flex" flexDirection="column">
                {props.main_content}
            </Box>
            <Box id="main_content_controls"  flexGrow={0} flexShrink={1} >
                <MainContentControls />
            </Box>
        </Box>
    )
}
