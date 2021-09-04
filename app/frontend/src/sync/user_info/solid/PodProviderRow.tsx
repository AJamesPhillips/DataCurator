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
    const [valid, set_valid] = useState(true)
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
        <td style={{ userSelect: "text", textTransform: "initial", backgroundColor: valid ? "" : "pink" }}>
            {!on_change_value && props.value}
            {on_change_value && <input
                type="text"
                style={{ width: 400 }}
                value={value}
                onChange={e =>
                {
                    const new_value = e.currentTarget.value
                    set_value(new_value)
                    const valid = ensure_valid_value(new_value)
                    set_valid(!!valid)
                }}
                onBlur={e =>
                {
                    const new_value = ensure_valid_value(value)
                    if (!new_value) return

                    if (new_value !== value) set_value(new_value)
                    on_change_value(new_value)
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
                    const new_value = ensure_valid_value(value)
                    if (!new_value) return
                    on_add(new_value)
                    set_value("")
                }}
            />}
        </td>
    </tr>
}

export const PodProviderRow = connector(_PodProviderRow) as FunctionalComponent<OwnProps>



function ensure_valid_value (value: string)
{
    if (!value) return ""

    if (!value.startsWith("http://") && !value.startsWith("https://")) value = "https://" + value

    try
    {
        const url = new URL(value)
        url.protocol = "https:"
        value = url.toString()

        if (!value.endsWith("/")) value += "/"

        return value
    }
    catch (e)
    {
        console.warn("error parsing user URL: ", e)
        return ""
    }
}
