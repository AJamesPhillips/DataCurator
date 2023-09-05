import { h } from "preact"
import { useEffect } from "preact/hooks"
import FilterCenterFocusIcon from "@mui/icons-material/FilterCenterFocus"
import { Box, IconButton, Tooltip } from "@mui/material"

import { pub_sub } from "../state/pub_sub/pub_sub"



interface MoveToItemButtonProps
{
    move?: () => void
    draw_attention?: boolean
    have_finished_drawing_attention?: () => void
    enable_spacebar_move_to_shortcut?: boolean
}
export function MoveToItemButton (props: MoveToItemButtonProps)
{
    const {
        move, draw_attention,
        have_finished_drawing_attention = () => {},
    } = props


    useEffect(() =>
    {
        if (!props.enable_spacebar_move_to_shortcut) return

        return pub_sub.global_keys.sub("key_down", e =>
        {
            // "space" bar is pressed
            if (move && e.key === " ")
            {
                // This does not work
                // // If the user just clicked on a button, this will prevent the space bar from firing that
                // // button again and instead only run the "move to wcomponents" functionality
                // // However we might want to re-evaluate this as using spacebar to generically trigger the
                // // previous action is a very useful system behaviour
                // e.event.preventDefault()

                move()
            }
        })
    }, [props.enable_spacebar_move_to_shortcut, move])


    return <Box>
        <Tooltip
            placement="top"
            title={move ? "Move to component(s)" : "No component(s) present"}
        >
            <span>
                <IconButton
                    size="medium"
                    onClick={move}
                    disabled={!move}
                >
                    <FilterCenterFocusIcon />
                </IconButton>
            </span>
        </Tooltip>
        <div
            className={(move && draw_attention) ? "pulsating_circle" : ""}
            ref={e => setTimeout(() =>
            {
                e?.classList.remove("pulsating_circle")
                have_finished_drawing_attention()
            }, 10000)}
        />
    </Box>
}
