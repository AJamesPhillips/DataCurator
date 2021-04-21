import { h } from "preact"
import { useState } from "preact/hooks"

import "./Editable.css"
import { correct_datetime_for_local_time_zone, date_to_string, valid_date_str } from "./datetime_utils"



interface OwnProps
{
    placeholder: string
    value: Date | undefined
    on_change: (new_value: Date) => void
}


export function EditableDateTime (props: OwnProps)
{
    const [value, set_value] = useState(date_to_string(props.value))
    const valid = !value || valid_date_str(value)

    return <div class={"editable_field " + (valid ? "" : "invalid ") }>
        <input
            type="text"
            placeholder={props.placeholder}
            value={value}
            onChange={e => set_value(e.currentTarget.value)}
            onBlur={() => {
                if (!valid) return

                const corrected_datetime = correct_datetime_for_local_time_zone(value)

                if (corrected_datetime.getTime() === props.value?.getTime()) return

                props.on_change(corrected_datetime)
            }}
        />
    </div>
}
