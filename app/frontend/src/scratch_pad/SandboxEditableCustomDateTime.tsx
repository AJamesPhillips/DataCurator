import { h } from "preact"
import { useState } from "preact/hooks"
import { EditableCustomDateTime } from "../form/EditableCustomDateTime"



export function SandboxEditableCustomDateTime ()
{
    const [custom_date, set_custom_date] = useState<Date | undefined>(undefined)

    return <div>
        EditableCustomDateTime
        {/* <EditableCustomDateTime
            invariant_value={undefined} //new Date("2021-04-15 14:02")}
            value={custom_date}
            on_change={custom_date => set_custom_date(custom_date)}
        />
        <EditableCustomDateTime
            invariant_value={undefined} //new Date("2021-04-15 14:02")}
            value={custom_date}
            on_change={custom_date => set_custom_date(custom_date)}
        /> */}

        <EditableCustomDateTime
            invariant_value={undefined}
            value={custom_date}
            on_change={custom_date => custom_date && set_custom_date(custom_date)}
        />
    </div>
}
