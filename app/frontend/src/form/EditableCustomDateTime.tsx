import { h } from "preact"

import "./Editable.css"
import { date_to_string, valid_date_str, str_to_date, correct_datetime_for_local_time_zone } from "./datetime_utils"
import { useEffect, useState } from "preact/hooks"
import { Button } from "../sharedf/Button"
import { date2str } from "../shared/utils/date_helpers"
import { test } from "../shared/utils/test"



interface OwnProps
{
    invariant_value: Date | undefined
    value: Date | undefined
    on_change?: (new_value: Date | undefined) => void
}


const shorten_if_only_days = true

export function EditableCustomDateTime (props: OwnProps)
{
    const working_value_from_props = props_to_str_value(props)
    const [working_value, set_working_value] = useState(working_value_from_props)
    const [editing, set_editing] = useState(false)
    // Ensure that if the props change, the working_value is updated
    useEffect(() => set_working_value(working_value_from_props), [working_value_from_props])

    const valid = !!(working_value && valid_date_str(working_value))


    const { invariant_value, value, on_change } = props
    if (!on_change) return <div>{working_value}</div>


    const class_name = "editable_field " + (valid ? "" : "invalid ")
    const title = "Created at " + (props.value ? "(custom)" : "")

    return <div className={class_name} title={title}>
        <input
            type="text"
            value={working_value}
            onFocus={e => {
                const { new_working_value } = handle_on_focus(e, props_value(props))
                set_working_value(new_working_value)
                set_editing(true)
            }}
            onChange={e => set_working_value(e.currentTarget.value)}
            onBlur={() => {
                const { new_value, new_working_value } = handle_on_blur({ valid, working_value, invariant_value, value })

                set_working_value(new_working_value)
                if (new_value !== false) on_change(new_value)
                set_editing(false)
            }}
        />
        {editing && <Button
            value="Today"
            on_pointer_down={() => {
                const new_working_value = date2str(new Date(), "yyyy-MM-dd") + " 00:00"
                set_working_value(new_working_value)
                on_change(new Date(new_working_value))
            }}
        />}
    </div>
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
    // e.currentTarget.setSelectionRange(0, e.currentTarget.value.length)
    return { new_working_value }
}



interface HandleOnBlurArgs
{
    valid: boolean
    working_value: string
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
    const { valid, working_value, invariant_value, value } = args

    let new_value: Date | undefined | false
    let new_working_value = date_to_string(new_value || invariant_value, shorten_if_only_days)

    if (!valid)
    {
        // Custom date is not valid
        new_value = undefined
    }
    else if (str_to_date(working_value).getTime() === (invariant_value && invariant_value.getTime()))
    {
        // Custom date is not needed
        new_value = undefined
    }
    else
    {
        const corrected_datetime = correct_datetime_for_local_time_zone(working_value)

        if (corrected_datetime.getTime() === value?.getTime())
        {
            const date_value_str = date_to_string(value, shorten_if_only_days)
            // Still need to set this in case it was a date with only days for the user's timezone,
            // i.e. if it was "2021-04-16 00:00", this needs to be re-rendered as "2021-04-16"
            new_working_value = date_value_str
            new_value = false
        }
        else new_value = corrected_datetime
    }

    return { new_value, new_working_value }
}



function run_tests ()
{
    console. log("running tests of handle_on_blur")

    let valid = true
    let working_value = "2020-01-01"
    let invariant_value = undefined
    let value = new Date("2020-01-01")
    let result = handle_on_blur({ valid, working_value, invariant_value, value })

    test(result.new_value, false)
    test(result.new_working_value, "2020-01-01")
}

// run_tests()
