import { get_today_str } from "datacurator-core/utils/date_helpers"
import { FunctionalComponent } from "preact"
import { useEffect, useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"
import { EditableCustomDateTime } from "../form/EditableCustomDateTime"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"



const map_state = (state: RootState) =>
({
    editing: !state.display_options.consumption_formatting,
})

const map_dispatch = {
    toggle_consumption_formatting: ACTIONS.display.toggle_consumption_formatting,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _SandboxEditableCustomDateTime (props: Props)
{
    const today_dt_str = get_today_str()
    const [custom_date, set_custom_date] = useState<Date | undefined>(new Date(today_dt_str))

    useEffect(() =>
    {
        if (!props.editing) props.toggle_consumption_formatting({})
    }, [])

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
            value={custom_date}
            on_change={custom_date => custom_date && set_custom_date(custom_date)}
        />
    </div>
}


export const SandboxEditableCustomDateTime = connector(_SandboxEditableCustomDateTime) as FunctionalComponent<{}>
