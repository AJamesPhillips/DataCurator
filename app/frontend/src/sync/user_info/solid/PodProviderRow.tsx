import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../../../state/State"
import { ACTIONS } from "../../../state/actions"
import { ConfirmatoryDeleteButton } from "../../../form/ConfirmatoryDeleteButton"
import { AddButton } from "../../../form/AddButton"
import { useState } from "preact/hooks"
import { useEffect } from "preact/hooks"



interface OwnProps
{
    solid_pod_URL_index?: number
    value?: string
    on_change_value?: (value: string) => void
    on_delete?: () => void
    on_add?: (value: string) => void
}


const map_state = (state: RootState) =>
{
    return {
        custom_solid_pod_URLs: state.user_info.custom_solid_pod_URLs,
        chosen_custom_solid_pod_URL_index: state.user_info.chosen_custom_solid_pod_URL_index,
    }
}

const map_dispatch = {
    update_chosen_pod_URL_index: ACTIONS.user_info.update_chosen_custom_solid_pod_URL_index,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _PodProviderRow (props: Props)
{
    const [value, set_value] = useState(props.value || "")
    useEffect(() => set_value(props.value || ""), [props.value])

    const { solid_pod_URL_index: index, on_change_value, on_delete, on_add } = props


    return <tr>
        <td>
            {index !== undefined && <input
                type="radio"
                checked={props.chosen_custom_solid_pod_URL_index === index}
                onClick={e => props.update_chosen_pod_URL_index({ chosen_custom_solid_pod_URL_index: index })}
            />}
        </td>
        <td style={{ userSelect: "text", textTransform: "initial" }}>
            {!on_change_value && props.value}
            {on_change_value && <input
                type="text"
                style={{ width: 250 }}
                value={value}
                onChange={e =>
                {
                    set_value(e.currentTarget.value)
                }}
                onBlur={e =>
                {
                    on_change_value(value)
                }}
            />}
        </td>
        <td>
            {on_delete && <ConfirmatoryDeleteButton
                button_text=""
                on_delete={on_delete}
            />}
            {on_add && <AddButton
                button_text=""
                on_click={() =>
                {
                    on_add(value)
                    set_value("")
                }}
            />}
        </td>
    </tr>
}

export const PodProviderRow = connector(_PodProviderRow) as FunctionalComponent<OwnProps>
