import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"
import { Box, makeStyles, Popover, TextField } from "@material-ui/core"
import FileCopyIcon from "@material-ui/icons/FileCopy"
import CalendarTodayIcon from "@material-ui/icons/CalendarToday"

import { date2str } from "../shared/utils/date_helpers"
import type { RootState } from "../state/State"



interface OwnProps
{
    title?: string
    invariant_value?: Date | undefined
    value?: Date | undefined
    on_change?: (new_datetime: Date | undefined) => void
    always_allow_editing?: boolean
    fullWidth?: boolean
    required?: boolean
    type?: string,
}

const map_state = (state: RootState) => ({
    time_resolution: state.display_options.time_resolution,
    presenting: state.display_options.consumption_formatting,
})
const connector = connect(map_state)

type Props = ConnectedProps<typeof connector> & OwnProps

function _MaterialDateTime (props: Props)
{
    const [popover_anchor, set_popover_anchor] = useState(null)
    const [is_valid_date, set_is_valid_date] = useState(true)
    const [the_date, set_the_date] = useState(props.value)

    const handle_manual_date_click = (e: any) => {
        set_popover_anchor(e.target)
    }
    const handle_close_paste_popover = () => {
        set_popover_anchor(null)
    }

    const not_editable = props.always_allow_editing ? false : props.presenting
    const is_popover_open: boolean = Boolean(popover_anchor)

    const on_popover_value_changed = (event: any) => {
        let input_element: HTMLInputElement = event.target
        let maybe_date = new Date(input_element.value)
        if (isNaN(maybe_date.getTime())) {
            console.error(`${input_element.value} is not a valid date or datetime value!`)
            set_is_valid_date(false)
        } else {
            set_is_valid_date(true)
            set_the_date(maybe_date)
            handle_close_paste_popover()
        }
    }

    const classes = use_styles()
    const date_format = "yyyy-MM-dd"
    const time_format = "hh: mm"
    const date_time_format = `${date_format}T${time_format}`
    let current_type = "date"
    let current_format_str = date_format
    switch (props.type) {
        case "time": {
            current_format_str = time_format
            current_type = "time"
            break
        }
        case "datetime": {
            current_format_str = date_time_format
            current_type = "datetime-local"
            break
        }
    }

    const title = (props.title || "DateTime") + ((props.invariant_value && props.value) ? " (custom)" : "")

    console.group(current_type)
    console .log(current_format_str)
    console.groupEnd()
    return (
        <Box display="flex" justifyContent="space-between">
            <TextField
                disabled={not_editable}
                fullWidth={(props.fullWidth || false)}
                InputProps={{
                    endAdornment: (!not_editable) && (
                        <FileCopyIcon
                            className={classes.open_popover_icon}
                            onClick={handle_manual_date_click}
                    />)
                }}
                label={(the_date) ? title : null}
                onChange={(e: any) => {
                    set_the_date(new Date(e.target.value))
                    if (props.on_change) props.on_change(new Date(e.target.value))
                }}
                required={props.required || false}
                size="small"
                type={current_type}
                value={(the_date) ? date2str(the_date, current_format_str) : null}
                variant="outlined"
            />
            <Popover
                open={is_popover_open}
                onClose={handle_close_paste_popover}
                anchorEl={popover_anchor}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
            >
                <Box p={10}>
                    <TextField
                        error={!is_valid_date}
                        helperText="Manually type or paste a date or date/time. Many formats are accepted."
                        // https: //developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats
                        InputProps={{ endAdornment: (<CalendarTodayIcon />) }}
                        onChange={on_popover_value_changed}
                        label="Date / DateTime"
                        size="small"
                        type="text"
                        variant="outlined"
                    />
                </Box>
            </Popover>
        </Box>
    )
}

export const MaterialDateTime = connector(_MaterialDateTime) as FunctionalComponent<OwnProps>


const use_styles = makeStyles(theme => ({
    open_popover_icon: {
        cursor: "pointer",
    }
}))
