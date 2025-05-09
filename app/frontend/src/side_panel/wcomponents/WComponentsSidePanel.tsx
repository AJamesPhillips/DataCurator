import { FunctionComponent } from "preact"
import { useEffect } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { Button } from "../../sharedf/Button"
import { LinkButton } from "../../sharedf/Link"
import { ACTIONS } from "../../state/actions"
import { get_wcomponent_from_state } from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { NotFoundWComponentKnowledgeViewForm } from "../../wcomponent_form/wcomponent_knowledge_view_form/NotFoundWComponentKnowledgeViewForm"
import { WComponentForm } from "../../wcomponent_form/WComponentForm"
import { CreateNewWComponent } from "./CreateNewWComponent"
import { ListOrphanedWComponents } from "./ListOrphanedWComponents"
import { WComponentMultipleForm } from "./WComponentMultipleForm"



interface OwnProps {}

const map_state = (state: RootState) =>
{
    const { ready_for_reading } = state.sync
    const { bases_by_id, chosen_base_id } = state.user_info
    const { sub_route, item_id } = state.routing
    const wcomponent = get_wcomponent_from_state(state, item_id)
    const selected_ids = state.meta_wcomponents.selected_wcomponent_ids_list

    return {
        bases_by_id,
        chosen_base_id,
        ready_for_reading,
        sub_route,
        item_id,
        wcomponent,
        selected_ids,
        editing: !state.display_options.consumption_formatting,
        wcomponent_ids_searched_for_in_any_base: state.sync.wcomponent_ids_searched_for_in_any_base,
    }
}


const map_dispatch = {
    clear_selected_wcomponents: ACTIONS.meta_wcomponents.clear_selected_wcomponents,
    set_or_toggle_display_select_storage: ACTIONS.controls.set_or_toggle_display_select_storage,
    request_searching_for_wcomponents_by_id_in_any_base: ACTIONS.sync.request_searching_for_wcomponents_by_id_in_any_base,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _WComponentsSidePanel (props: Props)
{
    const { ready_for_reading, item_id: id } = props
    const searching_for_unfound = id ? !props.wcomponent_ids_searched_for_in_any_base.has(id) : false
    const wcomponent = props.wcomponent

    const display_type: DisplayType = (props.bases_by_id && !props.chosen_base_id) ? DisplayType.need_to_choose_base_id
        : !ready_for_reading ? DisplayType.loading
        : props.sub_route === "wcomponents_edit_multiple" ? DisplayType.edit_multiple
        : id === null ? DisplayType.no_id
        : DisplayType.render_wcomponent


    // Look for wcomponent in any base
    useEffect(() =>
    {
        if (wcomponent) return
        if (display_type !== DisplayType.render_wcomponent) return
        if (!id) return

        props.request_searching_for_wcomponents_by_id_in_any_base({ ids: [id] })
    }, [ready_for_reading, display_type, id, wcomponent, searching_for_unfound])


    if (display_type === DisplayType.need_to_choose_base_id) return <div>
        <Button
            value="Choose a base to view"
            onClick={() => props.set_or_toggle_display_select_storage(true)}
        />
    </div>


    if (display_type === DisplayType.loading) return <div>Loading...</div>


    if (display_type === DisplayType.edit_multiple) return <div>
        <WComponentMultipleForm />
    </div>


    if (display_type === DisplayType.no_id) return <div>

        {props.selected_ids.length > 0 && <p>
            <div style={{ display: "inline-flex" }}>
                <LinkButton
                    name={`View ${props.selected_ids.length} component(s) already selected`}
                    route="wcomponents"
                    sub_route={props.selected_ids.length > 1 ? "wcomponents_edit_multiple" : undefined}
                    item_id={props.selected_ids.length === 1 ? props.selected_ids[0] : undefined}
                    args={undefined}
                />

                &nbsp;

                <Button
                    value={`Clear selection`}
                    onClick={() => props.clear_selected_wcomponents({})}
                    is_left={true}
                />
            </div>

            <br /><br />

            <hr />
        </p>}

        <CreateNewWComponent />

        <ListOrphanedWComponents />

    </div>


    if (wcomponent)
    {
        const wcomponent_from_different_base = !!props.wcomponent && props.wcomponent.base_id !== props.chosen_base_id
        return <WComponentForm wcomponent={wcomponent} wcomponent_from_different_base={wcomponent_from_different_base} />
    }


    return <div>
        Component not found for id: {id}

        <br />
        <br />

        {searching_for_unfound && <div>Searching in other bases...</div>}
        {!searching_for_unfound && <div>
            Not found in other bases (that you have access to).

            {props.editing && id && <NotFoundWComponentKnowledgeViewForm wcomponent_id={id} />}
        </div>}
    </div>
}


export const WComponentsSidePanel = connector(_WComponentsSidePanel) as FunctionComponent<OwnProps>



enum DisplayType {
    need_to_choose_base_id,
    loading,
    edit_multiple,
    no_id,
    render_wcomponent,
}
