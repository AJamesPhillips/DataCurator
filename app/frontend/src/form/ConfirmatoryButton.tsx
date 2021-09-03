import { Box, ThemeProvider, Tooltip } from "@material-ui/core"
import { h } from "preact"
import { useState } from "preact/hooks"

import { DefaultTheme, WarningTheme } from "../ui_themes/material_default"
import { Button } from "../sharedf/Button"



interface OwnProps
{
    on_click?: () => void,
    button_text: string
    button_icon?: h.JSX.Element
    tooltip_text?: string
    disabled?: boolean
}



export function ConfirmatoryButton (props: OwnProps)
{
    const [progressing, set_progressing] = useState(false)
    const { tooltip_text = "" } = props

    return (
        <Box display="flex" justifyContent="space-between" mb={3}>
            <ThemeProvider theme={WarningTheme}>
                <Button
                    color="secondary"
                    disabled={props.disabled}
                    is_hidden={!progressing}
                    onClick={e =>
                    {
                        e.stopImmediatePropagation()
                        set_progressing(false)
                        props.on_click && props.on_click()
                    }}
                    startIcon={props.button_icon}
                >
                    <Tooltip title={tooltip_text} aria-label={tooltip_text}>
                        <Box component="span">
                            CONFIRM
                        </Box>
                    </Tooltip>
                </Button>
            </ThemeProvider>
            <ThemeProvider theme={DefaultTheme}>
                <Button
                    color="primary"
                    disabled={props.disabled}
                    fullWidth={!progressing}
                    is_hidden={!props.on_click}
                    onClick={e =>
                    {
                        e.stopImmediatePropagation()
                        set_progressing(!progressing)
                    }}
                    startIcon={progressing ? "" : props.button_icon }
                >
                    <Tooltip title={progressing ? "" : tooltip_text } aria-label={progressing ? "" : tooltip_text }>
                        <Box component="span">
                            {progressing ? "Cancel" : props.button_text}
                        </Box>
                    </Tooltip>
                </Button>
            </ThemeProvider>
        </Box>
    )
}
