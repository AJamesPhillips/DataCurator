import { Box, StyledEngineProvider, Theme, ThemeProvider, Tooltip } from "@mui/material"
import { h } from "preact"
import { useState } from "preact/hooks"

import { Button } from "../sharedf/Button"
import { DefaultTheme, WarningTheme } from "../ui_themes/material_default"



declare module "@mui/styles/defaultTheme" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}



interface OwnProps
{
    on_click?: () => void
    button_text: string
    button_icon?: h.JSX.Element
    tooltip_text?: string
    disabled?: boolean
    ready_to_progress?: boolean
    on_cancel?: () => void
}



export function ConfirmatoryButton (props: OwnProps)
{
    const [ready_to_progress, set_ready_to_progress] = useState(props.ready_to_progress ?? false)
    const { tooltip_text = "" } = props

    return (
        <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0px" }}>
            <StyledEngineProvider injectFirst>
            <ThemeProvider theme={WarningTheme}>
                <Button
                    color="secondary"
                    disabled={props.disabled}
                    is_hidden={!ready_to_progress}
                    onClick={e =>
                    {
                        e.stopImmediatePropagation()
                        set_ready_to_progress(false)
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
                    fullWidth={!ready_to_progress}
                    is_hidden={!props.on_click}
                    onClick={e =>
                    {
                        e.stopImmediatePropagation()
                        set_ready_to_progress(!ready_to_progress)
                        if (ready_to_progress && props.on_cancel) props.on_cancel()
                    }}
                    startIcon={ready_to_progress ? "" : props.button_icon }
                >
                    <Tooltip title={ready_to_progress ? "" : tooltip_text } aria-label={ready_to_progress ? "" : tooltip_text }>
                        <Box component="span">
                            {ready_to_progress ? "Cancel" : props.button_text}
                        </Box>
                    </Tooltip>
                </Button>
            </ThemeProvider>
            </StyledEngineProvider>
        </div>
    )
}
