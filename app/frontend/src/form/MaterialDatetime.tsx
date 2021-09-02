import { FunctionalComponent, h, Ref } from "preact"

import "./Editable.css"
import { date_to_string, correct_datetime_for_local_time_zone, valid_date } from "./datetime_utils"
import { useState } from "preact/hooks"
import { Button } from "../sharedf/Button"
import { date2str, get_today_str } from "../shared/utils/date_helpers"
import { connect, ConnectedProps } from "react-redux"
import type { RootState } from "../state/State"
import type { TimeResolution } from "../shared/utils/datetime"
import { Box, IconButton, TextField } from "@material-ui/core"
import FileCopyIcon from '@material-ui/icons/FileCopy';

interface OwnProps
{
    title?: string
    value: Date | undefined
    on_change?: (new_datetime: Date | undefined) => void
    always_allow_editing?: boolean
}

const map_state = (state: RootState) => ({
    time_resolution: state.display_options.time_resolution,
    presenting: state.display_options.consumption_formatting,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps

function _MaterialDateTime (props: Props)
{
    const display_value = props_to_str_value(props)
    const [editing, set_editing] = useState(false)
    const no_entry_class_name = display_value ? "" : "no_entry"

    const { on_change } = props
    if (!on_change) return <div className={no_entry_class_name}>{display_value}</div>

    const valid = is_value_valid(display_value)

    const not_editable = props.always_allow_editing ? false : props.presenting
    const class_name = `editable_field ${valid ? "" : "invalid"} ${no_entry_class_name} ${not_editable ? "not_editable" : "" }`
    const set_textfield_input_value = (d?:Date) => {
        if (!d) return;
        let date_string = d.toISOString().split('.').shift();
        return date_string?.slice(0, -3);
    }
    console.log(props.value?.toISOString())
    return (
        <Box>
            <TextField
                className={class_name}
                value={set_textfield_input_value(props.value)}
                disabled={not_editable}
                size="small"
                type="datetime-local"
                variant="outlined"
                onChange={(e:any, value:any) => {
                   console.log(e);
                }}
            />
            {/* <IconButton>
                <FileCopyIcon />
            </IconButton> */}
        </Box>
    )
}

export const MaterialDateTime = connector(_MaterialDateTime) as FunctionalComponent<OwnProps>



function is_value_valid (str: string)
{
    const working_value_date = correct_datetime_for_local_time_zone(str)
    return !!working_value_date && valid_date(working_value_date)
}


interface NowButtonProps
{
    on_change: (new_date: Date | undefined) => void
}
function NowButton (props: NowButtonProps)
{
    return <Button
        value="Now"
        onClick={() => {
            // Add 30 seconds to ensure it rounds to nearest minute
            const datetime = new Date(new Date().getTime() + 30000)

            const new_working_value = date2str(datetime, "yyyy-MM-dd hh:mm")
            props.on_change(new Date(new_working_value))
        }}
    />
}



function props_value (args: { invariant_value?: Date | undefined, value: Date | undefined })
{
    const value = args.value || args.invariant_value
    return value
}



interface PropsToStrValueArgs
{
    invariant_value?: Date | undefined
    value: Date | undefined
    time_resolution: TimeResolution
}
function props_to_str_value (args: PropsToStrValueArgs)
{
    const date = props_value(args)
    const working_value = date_to_string({ date, time_resolution: args.time_resolution })
    return working_value
}



interface HandleOnBlurArgs
{
    invariant_value?: Date | undefined
    working_value: string
}
function handle_on_blur (args: HandleOnBlurArgs): Date | undefined
{
    const { working_value, invariant_value } = args

    let new_value: Date | undefined = correct_datetime_for_local_time_zone(working_value)

    if (new_value && new_value.getTime() === (invariant_value && invariant_value.getTime()))
    {
        // Custom date is not needed
        new_value = undefined
    }

    return new_value
}




// function run_tests ()
// {
//     console. log("running tests of handle_on_blur")

//     let valid: boolean
//     let invariant_value: Date | undefined
//     let value: Date | undefined
//     let working_value_date: Date
//     let result: HandleOnBlurReturn


//     valid = true
//     working_value_date = new Date("2020-01-01")
//     invariant_value = undefined
//     value = new Date("2020-01-01")
//     result = handle_on_blur({ valid, working_value_date, invariant_value, value })
//     test(result.new_value, false)
//     test(result.new_working_value, "2020-01-01")


//     valid = true
//     invariant_value = undefined
//     value = new Date("2021-04-25 08:37:41")
//     working_value_date = new Date("2021-04-25 08:37")
//     result = handle_on_blur({ valid, working_value_date, invariant_value, value })

//     // Note no seconds
//     const new_str_datetime = "2021-04-25 08:37"
//     test(result.new_value, new Date(new_str_datetime))
//     test(result.new_working_value, new_str_datetime)
// }

// run_tests()
