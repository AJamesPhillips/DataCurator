import { Box, ThemeProvider, Typography } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"

import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"
import { DefaultTheme, WarningTheme } from "../ui_themes/material_default"
import { Button } from "../sharedf/Button"
import type { RootState } from "../state/State"
import { Tooltip } from "@material-ui/core"
import DeleteIcon from '@material-ui/icons/Delete';


interface OwnProps
{
    on_delete?: () => void,
    button_text?: string
    tooltip_text?: string
}



const map_state = (state: RootState) => ({
    consumption_formatting: state.display_options.consumption_formatting,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _ConfirmatoryDeleteButton (props: Props)
{
    const [deleting, set_deleting] = useState(false)
    const toolip_text = props.tooltip_text || ""
    if (props.consumption_formatting) return null

    return (
		<Box display="flex" justifyContent="space-between" mb={3}>
			<ThemeProvider theme={WarningTheme}>
				<Button
                    color="secondary"
                    is_hidden={!deleting}
					onClick={() =>
					{
						set_deleting(false)
						props.on_delete && props.on_delete()
					}}
                    startIcon={<DeleteIcon />}
				>
                    <Tooltip title={toolip_text} aria-label={toolip_text}>
                        <Box component="span">
                            CONFIRM
                        </Box>
                    </Tooltip>
                </Button>
			</ThemeProvider>
            <ThemeProvider theme={DefaultTheme}>
                <Button
                    color="primary"
                    fullWidth={!deleting}
                    is_hidden={!props.on_delete}
                    onClick={() => set_deleting(!deleting) }
                    startIcon={deleting ? "" : <DeleteIcon />  }
                >
                    <Tooltip title={deleting ? ""  : toolip_text } aria-label={deleting ? ""  : toolip_text }>
                        <Box component="span">
                            {deleting ? "Cancel" : (props.button_text || "Delete") }
                        </Box>
                    </Tooltip>
                </Button>
            </ThemeProvider>
		</Box>
	)
}

export const ConfirmatoryDeleteButton = connector(_ConfirmatoryDeleteButton) as FunctionalComponent<OwnProps>