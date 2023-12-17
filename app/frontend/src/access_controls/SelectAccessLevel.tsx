import { Select, MenuItem } from "@mui/material"

import { sentence_case } from "../shared/utils/sentence_case"
import type { ACCESS_CONTROL_LEVEL } from "../supabase/interfaces"



interface SelectAccessLevelProps
{
    level: ACCESS_CONTROL_LEVEL
    current_level: ACCESS_CONTROL_LEVEL
    on_click: (level: ACCESS_CONTROL_LEVEL) => void
}


export function SelectAccessLevel (props: SelectAccessLevelProps)
{
    const { level, current_level, on_click } = props

    return <input
        type="button"
        onClick={() => on_click(level)}
        value={sentence_case(level)}
        disabled={level === current_level}
    />
}



interface SelectAccessLevelDropDownProps
{
    current_level: ACCESS_CONTROL_LEVEL
    disabled?: boolean
    title?: string
    on_change: (level: ACCESS_CONTROL_LEVEL) => void
}


export function SelectAccessLevelDropDown (props: SelectAccessLevelDropDownProps)
{
    const levels: ACCESS_CONTROL_LEVEL[] = ["editor", "viewer", "none"]

    return <Select
        variant="standard"
        disabled={props.disabled}
        value={props.current_level}
        title={props.title || "Select access level"}
        onChange={e => // e: h.JSX.TargetedEvent<HTMLSelectElement, Event>) =>
        {
            const level = (e.currentTarget! as HTMLSelectElement).getAttribute("data-value") as ACCESS_CONTROL_LEVEL
            props.on_change(level)
        }}
    >
        {levels.map(level => <MenuItem value={level}>{sentence_case(level)}</MenuItem>)}
    </Select>
}
