import { h } from "preact"
import { Button } from "../../sharedf/Button"
import type { AutocompleteOption } from "./interfaces"
import { color_to_opposite, color_to_string } from "../../sharedf/color"
import { Box, ButtonGroup, IconButton, Tooltip, Typography } from "@material-ui/core"
import ClearIcon from '@material-ui/icons/Clear';

interface Props <E extends AutocompleteOption = AutocompleteOption>
{
    editing: boolean
    option: E | undefined
    on_remove_option: (removed_id: string) => void
    on_mouse_over_option?: (id: E["id"] | undefined) => void
    on_mouse_leave_option?: (id: E["id"] | undefined) => void
    on_pointer_down_selected_option?: (e: h.JSX.TargetedPointerEvent<HTMLDivElement>, id: E["id"]) => void
}

export function SelectedOption <E extends AutocompleteOption> (props: Props<E>)
{
    const { editing, option, on_remove_option, on_mouse_over_option, on_mouse_leave_option,
        on_pointer_down_selected_option: pointer_down } = props

    if (!option) return null

    const class_name = `selected_option ${pointer_down ? "" : "not_"}clickable `
    return(
        <Box mb={1}>
			<ButtonGroup size="small" fullWidth={true}>
				{editing &&	<IconButton color="primary" onClick={() => on_remove_option(option.id)}>
						<ClearIcon />
					</IconButton>
				}
				<Button variant="contained" color="primary" onClick={(e:any) => pointer_down && pointer_down(e, option.id)}>
					<Tooltip title={option.jsx || option.title} aria-label={option.jsx || option.title}>
						<Typography noWrap>
							{option.jsx || option.title}
						</Typography>
					</Tooltip>
				</Button>
			</ButtonGroup>
		</Box>
    )
}