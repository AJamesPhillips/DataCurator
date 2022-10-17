import { h } from "preact"
import { Box, Typography } from "@material-ui/core"

import { ActionCommands, ShortcutProps } from "./shortcuts"


export function PlainShortcutKeys (props: { shortcut: string[] })
{
    return <div className="description" style={{ display: "inline" }}>
        {props.shortcut.join(" + ")}
    </div>
}


function ShortcutKeys (props: { shortcut: string[] })
{
    return <Typography component="dt" style={{ display: "inline" }}>
        {props.shortcut.map((command, index) => {
            const class_name = (command === ActionCommands.click || command === ActionCommands.drag)
                ? "physical_action" : "physical_button"

            return (
                <div style={{ display: "inline" }}>
                    <div className={class_name}>{command}</div>
                    {(index < (props.shortcut.length - 1)) && <span className="shortcut_plus"> + </span>}
                </div>
            )
        })}
    </Typography>
}



export function ShortcutCommand (props: ShortcutProps)
{
    return <Box component="dl">
        <ShortcutKeys shortcut={props.shortcut} />
        <div style={{ display: "inline" }}> &nbsp; {props.outcome} </div>
    </Box>
}
