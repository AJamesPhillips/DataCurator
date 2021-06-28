import { h } from "preact"
import { Button } from "../../sharedf/Button"
import type { AutocompleteOption } from "./interfaces"
import { color_to_opposite, color_to_string } from "../../sharedf/color"
import { ButtonGroup, IconButton, ThemeProvider } from "@material-ui/core"
import DeleteIcon from '@material-ui/icons/Delete';


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
		<ButtonGroup size="small" fullWidth={true}>
			{editing && <IconButton onClick={() => on_remove_option(option.id)}>
					<DeleteIcon color="error" />
				</IconButton>
			}
			<Button variant="contained" color="primary" onClick={(e:any) => pointer_down && pointer_down(e, option.id)}>
				{option.jsx || option.title}
			</Button>
		</ButtonGroup>
	)
}
