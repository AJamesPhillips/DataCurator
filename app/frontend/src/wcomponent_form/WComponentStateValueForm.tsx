import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AutocompleteText } from "../form/Autocomplete/AutocompleteText"
import { get_wcomponent_search_options } from "../search/get_wcomponent_search_options"
import { is_defined } from "../shared/utils/is_defined"
import { WComponent, wcomponent_should_have_state_VAP_sets } from "../wcomponent/interfaces/SpecialisedObjects"
import type { WComponentStateValue } from "../wcomponent/interfaces/state"
import { ExternalLinkIcon } from "../sharedf/icons/ExternalLinkIcon"
import { Link } from "../sharedf/Link"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { get_wc_id_to_counterfactuals_v2_map } from "../state/derived/accessor"
import { Button } from "../sharedf/Button"
import { get_current_composed_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import { SortDirection, sort_list } from "../shared/utils/sort"



interface OwnProps
{
    wcomponent: WComponentStateValue
    upsert_wcomponent: (partial_wcomponent: Partial<WComponentStateValue>) => void
}


const map_state = (state: RootState) =>
{
    return {
        current_knowledge_view_id: get_current_composed_knowledge_view_from_state(state)?.id,
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
        wcomponent_ids_with_state_VAPs: state.derived.wcomponent_ids_by_type.any_state_VAPs,
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
        editing: !state.display_options.consumption_formatting,
        wc_id_to_counterfactuals_map: get_wc_id_to_counterfactuals_v2_map(state),
    }
}


const map_dispatch = {
    set_highlighted_wcomponent: ACTIONS.specialised_object.set_highlighted_wcomponent,
    upsert_knowledge_view: ACTIONS.specialised_object.upsert_knowledge_view,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentStateValueForm (props: Props)
{
    const {
        current_knowledge_view_id,
        wcomponents_by_id,
        knowledge_views_by_id,
        wcomponent,
        upsert_wcomponent,
        wc_id_to_counterfactuals_map,
    } = props


    // If the current knowledge view has a wcomponent, then assume this is the owner
    // wcomponent and put this to the top of the list.  Otherwise sort to put the most
    // recently created components to the top of the list
    const get_key = (wc: WComponent) => wc.id === current_knowledge_view_id
        ? new Date().getTime()
        : wc.created_at.getTime()

    let possible_owner_wcomponents = Object.values(wcomponents_by_id)
    possible_owner_wcomponents = sort_list(possible_owner_wcomponents, get_key, SortDirection.descending)

    const owner_wcomponent_id_options = get_wcomponent_search_options({
        wcomponents: possible_owner_wcomponents,
        wcomponents_by_id,
        knowledge_views_by_id,
        wc_id_to_counterfactuals_map,
        created_at_ms: props.created_at_ms,
        sim_ms: props.sim_ms,
    })


    const wcomponents_with_state_VAP_sets = Array.from(props.wcomponent_ids_with_state_VAPs)
        .map(id => wcomponents_by_id[id])
        .filter(is_defined)
        .filter(wcomponent_should_have_state_VAP_sets)

    const attribute_wcomponent_id_options = get_wcomponent_search_options({
        wcomponents: wcomponents_with_state_VAP_sets,
        wcomponents_by_id,
        knowledge_views_by_id,
        wc_id_to_counterfactuals_map,
        created_at_ms: props.created_at_ms,
        sim_ms: props.sim_ms,
    })


    return <div>
        <p>
            <span className="description_label">Owner component</span> &nbsp;

            {wcomponent.owner_wcomponent_id && <Link
                route={undefined}
                sub_route={undefined}
                item_id={wcomponent.owner_wcomponent_id}
                args={undefined}
            ><ExternalLinkIcon /> &nbsp;</Link>}

            <div style={{ width: "60%", display: "inline-block" }}>
                <AutocompleteText
                    allow_none={true}
                    selected_option_id={wcomponent.owner_wcomponent_id}
                    options={owner_wcomponent_id_options}
                    on_change={owner_wcomponent_id => upsert_wcomponent({ owner_wcomponent_id })}
                    on_mouse_over_option={id => props.set_highlighted_wcomponent({ id, highlighted: true })}
                    on_mouse_leave_option={id => props.set_highlighted_wcomponent({ id, highlighted: false })}
                />
            </div>
        </p>


        <p>
            <span className="description_label">Attribute component</span> &nbsp;

            {wcomponent.attribute_wcomponent_id && <Link
                route={undefined}
                sub_route={undefined}
                item_id={wcomponent.attribute_wcomponent_id}
                args={undefined}
            ><ExternalLinkIcon /> &nbsp;</Link>}

            <div style={{ width: "60%", display: "inline-block" }}>
                <AutocompleteText
                    allow_none={true}
                    selected_option_id={wcomponent.attribute_wcomponent_id}
                    options={attribute_wcomponent_id_options}
                    on_change={attribute_wcomponent_id => upsert_wcomponent({ attribute_wcomponent_id })}
                    on_mouse_over_option={id => props.set_highlighted_wcomponent({ id, highlighted: true })}
                    on_mouse_leave_option={id => props.set_highlighted_wcomponent({ id, highlighted: false })}
                />
            </div>
        </p>
    </div>
}

export const WComponentStateValueForm = connector(_WComponentStateValueForm) as FunctionalComponent<OwnProps>
