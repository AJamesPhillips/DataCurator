import { h } from "preact"

import "./Editable.css"
import { date_to_string, correct_datetime_for_local_time_zone, valid_date } from "./datetime_utils"
import { useEffect, useState } from "preact/hooks"
import { Button } from "../sharedf/Button"
import { date2str, get_today_str } from "../shared/utils/date_helpers"
import { test } from "../shared/utils/test"



interface OwnProps
{
    invariant_value: Date | undefined
    value: Date | undefined
    on_change?: (new_value: Date | undefined) => void
    show_now_shortcut_button?: boolean
    show_today_shortcut_button?: boolean
}


const shorten_if_only_days = true

export function EditableCustomDateTime (props: OwnProps)
{
    const working_value_str_from_props = props_to_str_value(props)
    const [working_value_str, set_working_value_str] = useState(working_value_str_from_props)
    const [editing, set_editing] = useState(false)
    // Ensure that if the props change, the working_value is updated
    useEffect(() => set_working_value_str(working_value_str_from_props), [working_value_str_from_props])


    const { on_change } = props
    if (!on_change) return <div>{working_value_str}</div>


    const { invariant_value, value, show_now_shortcut_button = false, show_today_shortcut_button = true } = props


    const working_value_date = correct_datetime_for_local_time_zone(working_value_str)
    const valid = !!(working_value_str && valid_date(working_value_date))


    const class_name = "editable_field " + (valid ? "" : "invalid ")
    const title = "Created at " + (props.value ? "(custom)" : "")

    return <div className={class_name} title={title}>
        <input
            type="text"
            value={working_value_str}
            onFocus={e => {
                const { new_working_value } = handle_on_focus(e, props_value(props))
                set_working_value_str(new_working_value)
                set_editing(true)
            }}
            onChange={e => set_working_value_str(e.currentTarget.value)}
            onBlur={() => {
                const { new_value, new_working_value } = handle_on_blur({ valid, working_value_date, invariant_value, value })

                set_working_value_str(new_working_value)
                if (new_value !== false) on_change(new_value)
                set_editing(false)
            }}
        />
        {editing && show_now_shortcut_button && <NowButton
            set_working_value_str={set_working_value_str}
            on_change={on_change}
        />}
        {editing && show_today_shortcut_button && <Button
            value="Today"
            on_pointer_down={() => {
                const today_dt_str = get_today_str()
                set_working_value_str(today_dt_str)
                on_change(new Date(today_dt_str))
            }}
        />}
    </div>
}



interface NowButtonProps
{
    set_working_value_str: (s: string) => void
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
            props.set_working_value_str(new_working_value)
            props.on_change(new Date(new_working_value))
        }}
    />
}



function props_value (props: OwnProps)
{
    const value = props.value || props.invariant_value
    return value
}



function props_to_str_value (props: OwnProps)
{
    const value = props_value(props)
    const working_value = date_to_string(value, shorten_if_only_days)
    return working_value
}



function handle_on_focus (e: h.JSX.TargetedFocusEvent<HTMLInputElement>, value: Date | undefined)
{
    const new_working_value = date_to_string(value, false)
    e.currentTarget.value = new_working_value
    // Disabled for _?_ product reasoin
    // Enabled because when you want to clear a whole date it is alot easier to do. -- 2021-04-26 12:11
    e.currentTarget.setSelectionRange(0, e.currentTarget.value.length)
    return { new_working_value }
}



interface HandleOnBlurArgs
{
    valid: boolean
    working_value_date: Date
    invariant_value: Date | undefined
    value: Date | undefined
}
interface HandleOnBlurReturn
{
    new_value: Date | undefined | false
    new_working_value: string
}
function handle_on_blur (args: HandleOnBlurArgs): HandleOnBlurReturn
{
    const { valid, working_value_date, invariant_value, value } = args

    let new_value: Date | undefined | false
    let new_working_value = date_to_string(value || invariant_value, shorten_if_only_days)

    if (!valid)
    {
        // Custom date is not valid
        new_value = undefined
    }
    else if (working_value_date.getTime() === (invariant_value && invariant_value.getTime()))
    {
        // Custom date is not needed
        new_value = undefined
    }
    else
    {
        const date_value_str = date_to_string(working_value_date, shorten_if_only_days)
        // Still need to set this in case it was a date with only days for the user's timezone,
        // i.e. if it was "2021-04-16 00:00", this needs to be re-rendered as "2021-04-16"
        new_working_value = date_value_str

        if (working_value_date.getTime() === value?.getTime()) new_value = false
        else new_value = working_value_date
    }

    return { new_value, new_working_value }
}



function run_tests ()
{
    console. log("running tests of handle_on_blur")

    let valid: boolean
    let invariant_value: Date | undefined
    let value: Date | undefined
    let working_value_date: Date
    let result: HandleOnBlurReturn


    valid = true
    working_value_date = new Date("2020-01-01")
    invariant_value = undefined
    value = new Date("2020-01-01")
    result = handle_on_blur({ valid, working_value_date, invariant_value, value })
    test(result.new_value, false)
    test(result.new_working_value, "2020-01-01")


    valid = true
    invariant_value = undefined
    value = new Date("2021-04-25 08:37:41")
    working_value_date = new Date("2021-04-25 08:37")
    result = handle_on_blur({ valid, working_value_date, invariant_value, value })

    // Note no seconds
    const new_str_datetime = "2021-04-25 08:37"
    test(result.new_value, new Date(new_str_datetime))
    test(result.new_working_value, new_str_datetime)
}

// run_tests()
