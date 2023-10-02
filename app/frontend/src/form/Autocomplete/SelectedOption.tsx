import { h } from "preact"
import { ButtonGroup, IconButton, Tooltip, Typography } from "@mui/material"
import ClearIcon from "@mui/icons-material/Clear"

import { Button } from "../../sharedf/Button"
import type { AutocompleteOption } from "./interfaces"
import { color_to_opposite, color_to_string } from "../../sharedf/color"



interface Props <E extends AutocompleteOption = AutocompleteOption>
{
    editing: boolean
    option: E | undefined
    on_remove_option: (removed_id: string) => void
    on_mouse_over_option?: (id: E["id"] | undefined) => void
    on_mouse_leave_option?: (id: E["id"] | undefined) => void
    on_pointer_down_selected_option?: (e: h.JSX.TargetedPointerEvent<HTMLButtonElement>, id: E["id"]) => void
}

export function SelectedOption <E extends AutocompleteOption> (props: Props<E>)
{
    const {
        editing, option, on_remove_option, on_pointer_down_selected_option: pointer_down,
        // TODO reimplement these?
        on_mouse_over_option, on_mouse_leave_option,
    } = props


    if (!option) return null


    return (
        <ButtonGroup size="small" color="primary" variant="contained" fullWidth={true} disableElevation={true}>
            <Button
                onClick={e => pointer_down && pointer_down(e, option.id)}
                disabled={!pointer_down}
                style={{
                    cursor: !pointer_down ? "not-allowed" : "",
                    // If no color is present, then allow MaterialUI Button to use it's own
                    // prettier defaults (with on hover animation) rather than force it to be
                    // white (the default of color_to_string)
                    backgroundColor: option.color && color_to_string(option.color),
                    color: option.color && color_to_string(color_to_opposite(option.color)),
                }}>
                <Tooltip
                    title={option.jsx || option.title}
                    // aria-label={option.jsx || option.title}
                >
                    <Typography noWrap textOverflow="ellipsis" variant="caption">
                        {option.jsx || option.title}
                    </Typography>
                </Tooltip>
            </Button>
            {editing && <IconButton onClick={() => on_remove_option(option.id)} size="large">
                <ClearIcon />
            </IconButton>}
        </ButtonGroup>
    )
}
