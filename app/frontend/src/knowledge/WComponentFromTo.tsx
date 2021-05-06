import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./WComponentFromTo.css"
import { AutoCompleteOption, AutocompleteText } from "../form/AutocompleteText"
import { ConnectionTerminalType, WComponent, wcomponent_is_plain_connection } from "../shared/models/interfaces/SpecialisedObjects"
import type { RootState } from "../state/State"
import { ACTIONS } from "../state/actions"



interface OwnProps
{
    connection_terminal_type: ConnectionTerminalType
    connection_terminal_type_str?: string
    parent_wcomponent_id: string
    wcomponent: WComponent | undefined
    on_update: (wcomponent_id: string | undefined) => void
}


const map_state = (state: RootState) => ({
    wcomponents: state.derived.wcomponents,
})


const map_dispatch = {
    set_highlighted_wcomponent: ACTIONS.specialised_object.set_highlighted_wcomponent,
    set_intercept_wcomponent_click_to_edit_link: ACTIONS.specialised_object.set_intercept_wcomponent_click_to_edit_link,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentFromTo (props: Props)
{
    const {
        connection_terminal_type,
        parent_wcomponent_id,
        wcomponent,
        wcomponents,
        on_update,
        set_highlighted_wcomponent,
        set_intercept_wcomponent_click_to_edit_link,
    } = props

    const connector_type_str = props.connection_terminal_type_str
        || (connection_terminal_type === "effector" ? "From" :
            (connection_terminal_type === "effected" ? "To" :
            (connection_terminal_type === "meta-effector" ? "From Meta" : "To Meta")))

    const selected_option_id = wcomponent ? wcomponent.id : undefined

    const options: AutoCompleteOption[] = wcomponents.filter(wc => !wcomponent_is_plain_connection(wc))
        .map(wc => ({ id: wc.id, title: wc.title }))

    function set_intercept (intercept: boolean)
    {
        const edit_wcomponent_id = intercept ? parent_wcomponent_id : undefined
        set_intercept_wcomponent_click_to_edit_link({ edit_wcomponent_id, connection_terminal_type })
    }

    return <div title={wcomponent && wcomponent.title} className="wcomponent_from_to">
        <div>{connector_type_str + ":"} &nbsp;</div>
        <AutocompleteText
            placeholder={connector_type_str + "..."}
            selected_option_id={selected_option_id}
            options={options}
            allow_none={true}
            on_focus={() => set_intercept(true)}
            on_blur={() => set_intercept(false)}
            on_change={option_id => on_update(option_id)}
            on_mouse_over_option={id => set_highlighted_wcomponent({ id, highlighted: true })}
            on_mouse_leave_option={id => set_highlighted_wcomponent({ id, highlighted: false })}
        />
    </div>
}

export const WComponentFromTo = connector(_WComponentFromTo) as FunctionalComponent<OwnProps>
