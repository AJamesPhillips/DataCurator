import { MenuItem, Select } from "@mui/material"

import { sentence_case } from "../shared/utils/sentence_case"
import type { DB_ACCESS_CONTROL_LEVEL } from "../supabase/interfaces"


interface SelectAccessLevelDropDownProps
{
    current_level: DB_ACCESS_CONTROL_LEVEL
    disabled?: boolean
    title?: string
    on_change: (level: DB_ACCESS_CONTROL_LEVEL) => void
}


export function SelectAccessLevelDropDown (props: SelectAccessLevelDropDownProps)
{
    const levels: DB_ACCESS_CONTROL_LEVEL[] = ["editor", "viewer", "none"]

    return <Select
        variant="standard"
        disabled={props.disabled}
        value={props.current_level}
        title={props.title || "Select access level"}
        onChange={e => // e: h.JSX.TargetedEvent<HTMLSelectElement, Event>) =>
        {
            const level = (e.target as HTMLSelectElement).value as DB_ACCESS_CONTROL_LEVEL
            props.on_change(level)
        }}
    >
        {levels.map(level => <MenuItem value={level}>{sentence_case(level)}</MenuItem>)}
    </Select>
}
