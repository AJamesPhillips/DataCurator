import { Box, ThemeProvider, Tooltip } from "@material-ui/core"
import { h } from "preact"
import AddIcon from "@material-ui/icons/Add"

import { DefaultTheme } from "../ui_themes/material_default"
import { Button } from "../sharedf/Button"



interface OwnProps
{
    on_click: () => void,
    button_text: string
    button_icon?: h.JSX.Element
    tooltip_text?: string
}



export function AddButton (props: OwnProps)
{
    const { tooltip_text = "" } = props

    return (
        <ThemeProvider theme={DefaultTheme}>
            <Button
                color="primary"
                onClick={e =>
                {
                    e.stopImmediatePropagation()
                    props.on_click()
                }}
                startIcon={<AddIcon />}
            >
                <Tooltip title={tooltip_text} aria-label={tooltip_text}>
                    <Box component="span">
                        {props.button_text ?? "Add"}
                    </Box>
                </Tooltip>
            </Button>
        </ThemeProvider>
    )
}
