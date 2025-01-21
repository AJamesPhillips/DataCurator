import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AutocompleteText } from "../form/Autocomplete/AutocompleteText"
import { get_wcomponent_search_options } from "../search/get_wcomponent_search_options"
import { ExternalLinkIcon } from "../sharedf/icons/ExternalLinkIcon"
import { Link } from "../sharedf/Link"
import { ACTIONS } from "../state/actions"
import { get_wc_id_to_counterfactuals_v2_map } from "../state/derived/accessor"
import type { RootState } from "../state/State"
import type {
    ConnectionTerminalAttributeType,
} from "../wcomponent/interfaces/SpecialisedObjects"
import "./WComponentFromTo.css"



interface OwnProps
{
    connection_terminal_description: string
    wcomponent_id: string | undefined
    connection_terminal_type: ConnectionTerminalAttributeType

    on_update_id: (id: string | undefined) => void
    on_update_type?: (type: ConnectionTerminalAttributeType | undefined) => void

    exclude_ids?: Set<string>
}


const map_state = (state: RootState) => ({
    allowed_wcomponent_ids: state.derived.current_composed_knowledge_view?.wc_ids_by_type.any_node,
    wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
    knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
    wc_id_to_counterfactuals_map: get_wc_id_to_counterfactuals_v2_map(state),
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
        allowed_wcomponent_ids,
        wcomponents_by_id,
        knowledge_views_by_id,
        wc_id_to_counterfactuals_map,
        on_update_id,
        on_update_type,
        set_highlighted_wcomponent,
    } = props

    const wcomponent = wcomponent_id ? wcomponents_by_id[wcomponent_id] : undefined

    const wcomponent_id_options = get_wcomponent_search_options({
        wcomponents_by_id,
        // allowed_wcomponent_ids,
        knowledge_views_by_id,
        wc_id_to_counterfactuals_map,
        created_at_ms: props.created_at_ms,
        sim_ms: props.sim_ms,
        exclude_ids: props.exclude_ids,
    })

    const wcomponent_terminal_type_options: { id: ConnectionTerminalAttributeType, title: string }[] = [
        { id: "validity", title: "Validity" },
        { id: "state", title: "State" },
        { id: "meta", title: "Meta" },
    ]


    return <div title={wcomponent && wcomponent.title} className="wcomponent_from_to">
        <span className="description_label">{connection_terminal_description} &nbsp;</span>
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
