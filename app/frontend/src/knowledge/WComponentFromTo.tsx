import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./WComponentFromTo.css"
import { AutocompleteText } from "../form/Autocomplete/AutocompleteText"
import {
    ConnectionTerminalAttributeType,
    wcomponent_is_plain_connection,
} from "../shared/wcomponent/interfaces/SpecialisedObjects"
import type { RootState } from "../state/State"
import { ACTIONS } from "../state/actions"
import { get_wcomponent_search_options } from "../search/get_wcomponent_search_options"
import { get_current_UI_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import { ExternalLinkIcon } from "../sharedf/ExternalLinkIcon"
import { Link } from "../utils/Link"



interface OwnProps
{
    connection_terminal_description: string
    wcomponent_id: string | undefined
    connection_terminal_type: ConnectionTerminalAttributeType

    on_update_id: (id: string | undefined) => void
    on_update_type?: (type: ConnectionTerminalAttributeType | undefined) => void
}


const map_state = (state: RootState) => ({
    wcomponents: state.derived.wcomponents,
    wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
    wc_id_counterfactuals_map: get_current_UI_knowledge_view_from_state(state)?.wc_id_counterfactuals_map,
    created_at_ms: state.routing.args.created_at_ms,
    sim_ms: state.routing.args.sim_ms,
})


const map_dispatch = {
    set_highlighted_wcomponent: ACTIONS.specialised_object.set_highlighted_wcomponent,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentFromTo (props: Props)
{
    const {
        connection_terminal_description,
        wcomponent_id,
        connection_terminal_type,
        wcomponents,
        wcomponents_by_id,
        on_update_id,
        on_update_type,
        set_highlighted_wcomponent,
    } = props

    const wcomponent = wcomponent_id ? wcomponents_by_id[wcomponent_id] : undefined

    const filtered_wcomponents = wcomponents.filter(wc => !wcomponent_is_plain_connection(wc))
    const wcomponent_id_options = get_wcomponent_search_options({
        wcomponents: filtered_wcomponents,
        wcomponents_by_id: props.wcomponents_by_id,
        wc_id_counterfactuals_map: props.wc_id_counterfactuals_map,
        created_at_ms: props.created_at_ms,
        sim_ms: props.sim_ms,
    })

    const wcomponent_terminal_type_options: { id: ConnectionTerminalAttributeType, title: string }[] = [
        { id: "validity", title: "Validity" },
        { id: "state", title: "State" },
        { id: "meta", title: "Meta" },
    ]


    return <div title={wcomponent && wcomponent.title} className="wcomponent_from_to">
        <div>{connection_terminal_description + ":"} &nbsp;</div>
        <AutocompleteText
            placeholder={connection_terminal_description + "..."}
            selected_option_id={wcomponent_id}
            options={wcomponent_id_options}
            allow_none={true}
            on_change={option_id => on_update_id(option_id)}
            on_mouse_over_option={id => set_highlighted_wcomponent({ id, highlighted: true })}
            on_mouse_leave_option={id => set_highlighted_wcomponent({ id, highlighted: false })}
        />

        {wcomponent_id && <Link
            route={undefined}
            sub_route={undefined}
            item_id={wcomponent_id}
            args={undefined}
        ><ExternalLinkIcon /></Link>}

        {on_update_type && <AutocompleteText
            placeholder="attribute..."
            selected_option_id={connection_terminal_type}
            options={wcomponent_terminal_type_options}
            allow_none={false}
            on_change={type => on_update_type(type)}
            on_mouse_over_option={type => set_highlighted_wcomponent({ id: wcomponent_id, highlighted: true })}
            on_mouse_leave_option={type => set_highlighted_wcomponent({ id: wcomponent_id, highlighted: false })}
        />}
    </div>
}

export const WComponentFromTo = connector(_WComponentFromTo) as FunctionalComponent<OwnProps>
