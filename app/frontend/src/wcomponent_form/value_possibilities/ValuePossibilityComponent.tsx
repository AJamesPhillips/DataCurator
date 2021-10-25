import { h } from "preact"
import { useEffect, useState } from "preact/hooks"
import { Box, ButtonGroup, IconButton, Typography } from "@material-ui/core"
import DeleteIcon from "@material-ui/icons/Delete"

import "../../form/editable_list/EditableListEntry.css"
import type { ValuePossibility } from "../../wcomponent/interfaces/possibility"
import { EditableTextSingleLine } from "../../form/editable_text/EditableTextSingleLine"
import { ValuePossibilityDuplicate } from "./ValuePossibilityDuplicate"
import { VALUE_POSSIBILITY_IDS_to_text } from "../../wcomponent/value/parse_value"



interface OwnProps
{
    editing: boolean
    value_possibility: ValuePossibility
    count_of_value_possibilities: {[value: string]: number}
    update_value_possibility: (value_possibility: ValuePossibility | undefined) => void
}


export function ValuePossibilityComponent (props: OwnProps)
{
    const { editing, value_possibility, count_of_value_possibilities, update_value_possibility } = props
    const [current_value, set_current_value] = useState(value_possibility.value)
    useEffect(() => set_current_value(value_possibility.value), [value_possibility.value])

    const count = count_of_value_possibilities[current_value.toLowerCase()] || 0
    const warning = count > 1 ? `Current value "${current_value}" is already present in other possible values.` : ""


    return <Box key={props.value_possibility.id} p={1} flexGrow={1} flexShrink={1} flexBasis="100%" maxWidth="100%" marginTop="5px" style={{ display: "flex" }}>
        <Box style={{ width: "100%" }}>
            <ValuePossibilityDuplicate warning={warning} />
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
                            value: value,
                        })
                    }}
                />
            </Typography>
        </Box>
        <Box style={{ width: 100, color: "#cb4", cursor: "pointer" }} title="Using interoperable ID">
            {VALUE_POSSIBILITY_IDS_to_text[value_possibility.id]}
        </Box>
        {editing && <IconButton onClick={() => update_value_possibility(undefined)}>
            <DeleteIcon />
        </IconButton>}
    </Box>
}
