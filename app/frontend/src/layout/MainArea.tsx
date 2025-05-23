import { h } from "preact"

import { Box } from "@mui/material"
import "./MainArea.scss"
import { MainContentControls } from "./MainContentControls"



interface OwnProps {
    main_content: h.JSX.Element
    extra_content?: h.JSX.Element
}

export function MainArea (props: OwnProps)
{
    return (
        <Box id="main_area" display="flex" flexDirection="column" flexGrow={1} flexShrink={1} zIndex={1}>
            <Box id="main_content" flexGrow={1} flexShrink={1} display="flex" flexDirection="column" position="relative" zIndex={1}>
                {props.main_content}
            </Box>
            <Box id="main_content_controls" bgcolor="#fafafa" flexGrow={0} flexShrink={1} position="relative" zIndex={10}>
                <MainContentControls />
            </Box>
            {props.extra_content}
        </Box>
    )
}
