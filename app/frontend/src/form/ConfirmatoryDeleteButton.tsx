import { Box, ThemeProvider } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"

import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"
import { DefaultTheme, WarningTheme } from "../ui_themes/material_default"
import { Button } from "../sharedf/Button"
import type { RootState } from "../state/State"



interface OwnProps
{
    on_delete?: () => void
}



const map_state = (state: RootState) => ({
    consumption_formatting: state.display_options.consumption_formatting,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _ConfirmatoryDeleteButton (props: Props)
{
    const [deleting, set_deleting] = useState(false)

    if (props.consumption_formatting) return null

    return (
		<Box display="flex" justifyContent="space-between" mb={3}>
			<ThemeProvider theme={WarningTheme}>
				<Button
					color="secondary"
					is_hidden={!deleting}
					value="CONFIRM"
					extra_class_names="button_warning"
					onClick={() => props.on_delete && props.on_delete()}
				/>
			</ThemeProvider>

			<ThemeProvider theme={(deleting) ? DefaultTheme: WarningTheme  }>
				<Button
					color="primary"
					is_hidden={!props.on_delete}
					onClick={() => set_deleting(!deleting) }
				>{deleting ? "CANCEL" : "DELETE"}</Button>
			</ThemeProvider>
		</Box>
	)
}

export const ConfirmatoryDeleteButton = connector(_ConfirmatoryDeleteButton) as FunctionalComponent<OwnProps>
