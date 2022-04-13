import { FunctionComponent, h } from "preact"
import { useEffect, useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { get_wcomponent_from_state } from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { CreateNewWComponent } from "./CreateNewWComponent"
import { WComponentForm } from "../../wcomponent_form/WComponentForm"
import { WComponentMultipleForm } from "./WComponentMultipleForm"
import { LinkButton } from "../../sharedf/Link"
import { Button } from "../../sharedf/Button"
import { ACTIONS } from "../../state/actions"
import type { WComponent } from "../../wcomponent/interfaces/SpecialisedObjects"
import { get_supabase } from "../../supabase/get_supabase"
import { supabase_get_wcomponents_from_any_base } from "../../state/sync/supabase/wcomponent"
import { WComponentKnowledgeViewForm } from "../../wcomponent_form/wcomponent_knowledge_view_form/WComponentKnowledgeViewForm"
import { NotFoundWComponentKnowledgeViewForm } from "../../wcomponent_form/wcomponent_knowledge_view_form/NotFoundWComponentKnowledgeViewForm"



interface OwnProps {}

const map_state = (state: RootState) =>
{
    const { ready_for_reading: ready } = state.sync
    const { bases_by_id, chosen_base_id } = state.user_info
    const { sub_route, item_id } = state.routing
    const wcomponent = get_wcomponent_from_state(state, item_id)
    const selected_ids = state.meta_wcomponents.selected_wcomponent_ids_list

    return {
        bases_by_id,
        chosen_base_id,
        ready,
        sub_route,
        item_id,
        wcomponent,
        selected_ids,
        editing: !state.display_options.consumption_formatting,
    }
}


const map_dispatch = {
    clear_selected_wcomponents: ACTIONS.meta_wcomponents.clear_selected_wcomponents,
    set_or_toggle_display_select_storage: ACTIONS.controls.set_or_toggle_display_select_storage,
    add_wcomponent_to_store: ACTIONS.specialised_object.add_wcomponent_to_store,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _WComponentsSidePanel (props: Props)
{
    const [searching_for_unfound, set_searching_for_unfound] = useState<boolean | undefined>(undefined)

    const { ready, item_id: id } = props
    const wcomponent = props.wcomponent

    const display_type: DisplayType = (props.bases_by_id && !props.chosen_base_id) ? DisplayType.need_to_choose_base_id
        : !ready ? DisplayType.loading
        : props.sub_route === "wcomponents_edit_multiple" ? DisplayType.edit_multiple
        : id === null ? DisplayType.no_id
        : DisplayType.render_wcomponent


    function clear_old_wcomponent_from_other_base ()
    {
        if (id && wcomponent?.id !== id)
        {
            set_searching_for_unfound(undefined)
        }
    }


    function look_for_wcomponent_in_any_base ()
    {
        if (ready
            && display_type === DisplayType.render_wcomponent
            && id // this is only a type guard as display_type will be "no_id" if `id === null`
            && !wcomponent
            && searching_for_unfound === undefined
        )
        {
            ;(async () => {

                set_searching_for_unfound(true)
                const result = await search_for_wcomponent_in_all_bases(id)

                if (result.wcomponents[0])
                {
                    props.add_wcomponent_to_store({ wcomponent: result.wcomponents[0] })
                }
                set_searching_for_unfound(false)
            })()
        }
    }

    useEffect(clear_old_wcomponent_from_other_base, [wcomponent, id])
    useEffect(look_for_wcomponent_in_any_base, [ready, display_type, wcomponent, searching_for_unfound, id])


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



function search_for_wcomponent_in_all_bases (wcomponent_id: string)
{
    const supabase = get_supabase()
    return supabase_get_wcomponents_from_any_base({ supabase, ids: [wcomponent_id] })
}
