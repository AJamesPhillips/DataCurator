import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { TextField } from "@material-ui/core"

import "./Editable.css"
import { date_to_string, correct_datetime_for_local_time_zone, valid_date } from "./datetime_utils"
import { useState } from "preact/hooks"
import { Button } from "../sharedf/Button"
import { date2str, get_today_str } from "../shared/utils/date_helpers"
import type { RootState } from "../state/State"
import type { TimeResolution } from "../shared/utils/datetime"
import { find_parent_element_by_class } from "../utils/html"



interface OwnProps
{
    title?: string
    invariant_value?: Date | undefined
    value: Date | undefined
    on_change?: (new_value: Date | undefined) => void
    show_now_shortcut_button?: boolean
    show_today_shortcut_button?: boolean
    force_editable?: boolean
}


const map_state = (state: RootState) => ({
    time_resolution: state.display_options.time_resolution,
    presenting: state.display_options.consumption_formatting,
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _EditableCustomDateTime (props: Props)
{
    const display_value = props_to_str_value(props)
    const [editing, set_editing] = useState(false)

    const no_entry_class_name = display_value ? "" : "no_entry"

    const { on_change } = props
    if (!on_change) return <div className={no_entry_class_name}>{display_value}</div>
    const { invariant_value, show_now_shortcut_button = false, show_today_shortcut_button = true } = props

    const valid = is_value_valid(display_value)

    const not_editable = props.force_editable !== undefined ? !props.force_editable : props.presenting
    const class_name = `editable_field ${valid ? "" : "invalid"} ${no_entry_class_name} ${not_editable ? "not_editable" : "" }`
    const title = (props.title || "DateTime") + ((props.invariant_value && props.value) ? " (custom)" : "")


    function conditional_on_change (new_value: Date | undefined)
    {
        if (!on_change) return // type guard
        if (diff_value(props.value, new_value)) on_change(new_value)
    }


    return <div className={class_name} title={title}>
        <TextField
            disabled={not_editable}
            type="text"
            label={title}
            value={display_value}
            onFocus={() => set_editing(true)}
            inputRef={((r: HTMLInputElement | null) =>
            {
                if (!r || !editing) return
                // Because we do not dispatch any state changes to react on changing the value
                // this code block should only be run **once** on the render cycle immediately
                // after focusing the input element
                const date = props_value(props)
                const new_working_value = date_to_string({ date, time_resolution: "minute", trim_midnight: false })
                r.value = new_working_value

                r.setSelectionRange(0, r.value.length)
            }) as any}

            // Can not use onKeyPress as `Escape` key is never captured & reported by this method
            onKeyDown={(e: h.JSX.TargetedKeyboardEvent<HTMLInputElement>) =>
            {
                const is_enter = e.key === "Enter"
                const is_escape = e.key === "Escape"

                if (is_enter || is_escape) (e.target as any)?.blur()
            }}

            onChange={(e: h.JSX.TargetedEvent<HTMLInputElement, Event>) =>
            {
                const valid = is_value_valid(e.currentTarget.value)
                const el = find_parent_element_by_class(e.currentTarget, "editable_field")
                if (!el) return

                if (valid) el.classList.remove("invalid")
                else el.classList.add("invalid")
            }}

            onBlur={(e: h.JSX.TargetedFocusEvent<HTMLInputElement>) => {
                const working_value = e.currentTarget.value
                const new_value = handle_on_blur({ working_value, invariant_value })
                conditional_on_change(new_value)
                set_editing(false)
            }}

            size="small"
            variant="outlined"
            fullWidth={true}
        />
        {editing && show_now_shortcut_button && <NowButton
            on_change={conditional_on_change}
        />}
        {editing && show_today_shortcut_button && <Button
            value="Today"
            // MUST use onPointerDown otherwise onClick is never fired.  As expected, the onBlur
            // fires first but unexpectedly this onClick does not fire
            onPointerDown={() => {
                const today_dt_str = get_today_str()
                conditional_on_change(new Date(today_dt_str))
            }}
        />}
    </div>
}

export const EditableCustomDateTime = connector(_EditableCustomDateTime) as FunctionalComponent<OwnProps>



function is_value_valid (str: string)
{
    if (!str.trim()) return true // is an eternal datetime so is valid

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



function diff_value (value1: Date | undefined, value2: Date | undefined)
{
    const value1_ms = value1?.getTime()
    const value2_ms = value2?.getTime()

    return value1_ms !== value2_ms
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
