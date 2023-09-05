import { Box, ThemeProvider, Theme, StyledEngineProvider, Tooltip } from "@mui/material"
import { h } from "preact"
import { useState } from "preact/hooks"

import { DefaultTheme, WarningTheme } from "../ui_themes/material_default"
import { Button } from "../sharedf/Button"



declare module "@mui/styles/defaultTheme" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}



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
        <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0px" }}>
            <StyledEngineProvider injectFirst>
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
            </StyledEngineProvider>
            <StyledEngineProvider injectFirst>
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
            </StyledEngineProvider>
        </div>
    )
}
