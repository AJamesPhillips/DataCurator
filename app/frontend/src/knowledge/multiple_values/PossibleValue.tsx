import { h } from "preact"
import { useEffect, useState } from "preact/hooks"
import { Box, ButtonGroup, IconButton, Typography } from "@material-ui/core"
import DeleteIcon from "@material-ui/icons/Delete"
import WarningIcon from "@material-ui/icons/Warning"

import "../../form/editable_list/EditableListEntry.css"
import type { ValuePossibility } from "../../shared/wcomponent/interfaces/possibility"
import { EditableTextSingleLine } from "../../form/editable_text/EditableTextSingleLine"



interface OwnProps
{
    editing: boolean
    value_possibility: ValuePossibility
    existing_values: Set<string>
    update_value_possibility: (value_possibility: ValuePossibility | undefined) => void
}


export function PossibleValue (props: OwnProps)
{
    const { editing, value_possibility, existing_values, update_value_possibility } = props
    const other_values = new Set(existing_values)
    other_values.delete(value_possibility.value)

    const [current_value, set_current_value] = useState("")
    useEffect(() => set_current_value(value_possibility.value), [value_possibility.value])
    const warning = other_values.has(current_value) ? `Current value "${current_value}" is already present in other possible values.` : ""


    return <Box key={props.value_possibility.id} p={1} flexGrow={1} flexShrink={1} flexBasis="100%" maxWidth="100%" marginTop="5px">
        <ButtonGroup size="small" color="primary" variant="contained" fullWidth={true} disableElevation={true}>
            <Box style={{ width: "100%" }}>
                <Typography noWrap variant="caption" title={warning} aria-label={warning} style={{ display: warning ? "inline" : "none" }}>
                    <WarningIcon />
                </Typography>
                <Typography noWrap textOverflow="ellipsis" variant="caption">
                    <EditableTextSingleLine
                        placeholder="Possible value"
                        hide_label={true}
                        value={value_possibility.value}
                        conditional_on_change={value => set_current_value(value)}
                        conditional_on_blur={value =>
                        {
                            update_value_possibility({
                                ...value_possibility,
                                value,
                            })
                        }}
                    />
                </Typography>
            </Box>
            {editing && <IconButton onClick={() => update_value_possibility(undefined)}>
                <DeleteIcon />
            </IconButton>}
        </ButtonGroup>
    </Box>
}
