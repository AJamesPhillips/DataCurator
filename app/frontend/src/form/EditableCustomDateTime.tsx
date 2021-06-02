import { FunctionalComponent, h } from "preact"

import "./Editable.css"
import { date_to_string, correct_datetime_for_local_time_zone, valid_date } from "./datetime_utils"
import { useState } from "preact/hooks"
import { Button } from "../sharedf/Button"
import { date2str, get_today_str } from "../shared/utils/date_helpers"
import { connect, ConnectedProps } from "react-redux"
import type { RootState } from "../state/State"
import type { TimeResolution } from "../shared/utils/datetime"



interface OwnProps
{
    invariant_value?: Date | undefined
    value: Date | undefined
    on_change?: (new_value: Date | undefined) => void
    show_now_shortcut_button?: boolean
    show_today_shortcut_button?: boolean
}


const map_state = (state: RootState) => ({
    time_resolution: state.display_options.time_resolution,
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps

const shorten_if_only_days = true

function _EditableCustomDateTime (props: Props)
{
    const display_value = props_to_str_value(props)
    const [editing, set_editing] = useState(false)

    const no_entry_class_name = display_value ? "" : " no_entry "

    const { on_change } = props
    if (!on_change) return <div className={no_entry_class_name}>{display_value}</div>


    const { invariant_value, show_now_shortcut_button = false, show_today_shortcut_button = true } = props


    const valid = is_value_valid(display_value)


    const class_name = "editable_field " + (valid ? "" : "invalid ") + no_entry_class_name
    const title = "Created at " + (props.value ? "(custom)" : "")

    return <div className={class_name} title={title}>
        <input
            type="text"
            value={display_value}
            onFocus={() => set_editing(true)}
            ref={r =>
            {
                if (!r || !editing) return
                // Because we do not dispatch any state changes to react on changing the value
                // this code block should only be run **once** on the render cycle immediately
                // after focusing the input element
                const new_working_value = date_to_string(props_value(props), "minute", false)
                r.value = new_working_value

                r.setSelectionRange(0, r.value.length)
            }}
            onChange={e =>
            {
                const valid = is_value_valid(e.currentTarget.value)
                if (valid) e.currentTarget.classList.remove("invalid")
                else e.currentTarget.classList.add("invalid")
            }}
            onBlur={e => {
                const working_value = e.currentTarget.value
                const new_value = handle_on_blur({ working_value, invariant_value })
                on_change(new_value)
                set_editing(false)
            }}
        />
        {editing && show_now_shortcut_button && <NowButton
            on_change={on_change}
        />}
        {editing && show_today_shortcut_button && <Button
            value="Today"
            on_pointer_down={() => {
                const today_dt_str = get_today_str()
                on_change(new Date(today_dt_str))
            }}
        />}
    </div>
}

export const EditableCustomDateTime = connector(_EditableCustomDateTime) as FunctionalComponent<OwnProps>



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
        on_pointer_down={() => {
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
    const value = props_value(args)
    const working_value = date_to_string(value, args.time_resolution)
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
