import { ArrowUpward, ArrowDownward, Delete as DeleteIcon } from "@mui/icons-material"
import { Box, IconButton, Tooltip } from "@mui/material"

import { ConfirmatoryButton } from "../../form/ConfirmatoryButton"
import { AddRowAbove } from "../../sharedf/icons/AddRowAbove"
import { AddRowBelow } from "../../sharedf/icons/AddRowBelow"
import { useState } from "preact/hooks"



export type EditableCalculationRowCommands = "move_up" | "move_down" | "add_above" | "add_below"

interface OwnProps
{
    delete_calculation: () => void
    disallowed_commands: Set<EditableCalculationRowCommands>
    update_calculations: (command: EditableCalculationRowCommands) => void
}


export function EditableCalculationRowOptions (props: OwnProps)
{
    const [ready_to_delete, set_ready_to_delete] = useState(false)

    return <Box style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
        <Tooltip title="Add above">
            <IconButton
                onClick={() => props.update_calculations("add_above")}
                size="large"
                // title="Add calculation above"
            >
                <AddRowAbove style={{ fill: "currentColor", height: "24px", width: "24px" }} />
            </IconButton>
        </Tooltip>

        <Tooltip title="Add below">
            <IconButton
                onClick={() => props.update_calculations("add_below")}
                size="large"
            >
                <AddRowBelow style={{ fill: "currentColor", height: "24px", width: "24px" }} />
            </IconButton>
        </Tooltip>

        <Tooltip title="Move up">
            <IconButton
                onClick={() => props.update_calculations("move_up")}
                size="large"
                disabled={props.disallowed_commands.has("move_up")}
            >
                <ArrowUpward />
            </IconButton>
        </Tooltip>

        <Tooltip title="Move down">
            <IconButton
                onClick={() => props.update_calculations("move_down")}
                size="large"
                disabled={props.disallowed_commands.has("move_down")}
            >
                <ArrowDownward />
            </IconButton>
        </Tooltip>

        {!ready_to_delete && <IconButton onClick={() => set_ready_to_delete(true)} size="large">
            <DeleteIcon />
        </IconButton>}
        {ready_to_delete && <ConfirmatoryButton
            on_click={props.delete_calculation}
            button_text=""
            button_icon={<DeleteIcon />}
            ready_to_progress={true}
            on_cancel={() => set_ready_to_delete(false)}
        />}
    </Box>
}
