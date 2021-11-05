import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { get_wcomponent_from_state } from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { CreateNewWComponent } from "./CreateNewWComponent"
import { WComponentForm } from "../../wcomponent_form/WComponentForm"
import { WComponentMultipleForm } from "./WComponentMultipleForm"
import { LinkButton } from "../../sharedf/Link"
import { Button } from "../../sharedf/Button"
import { ACTIONS } from "../../state/actions"
import { useState } from "preact/hooks"
import { useEffect } from "react"
import type { WComponent } from "../../wcomponent/interfaces/SpecialisedObjects"
import { get_supabase } from "../../supabase/get_supabase"
import { supabase_get_wcomponent_from_any_base } from "../../state/sync/supabase/wcomponent"



interface OwnProps {}

const map_state = (state: RootState) =>
{
    const { ready_for_reading: ready } = state.sync
    const { sub_route } = state.routing
    const id = state.routing.item_id
    const wcomponent = get_wcomponent_from_state(state, id)
    const selected_ids = state.meta_wcomponents.selected_wcomponent_ids_list

    return { ready, sub_route, id, wcomponent, selected_ids }
}


const map_dispatch = {
    clear_selected_wcomponents: ACTIONS.specialised_object.clear_selected_wcomponents,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _WComponentsSidePanel (props: Props)
{
    const [searching_for_unfound, set_searching_for_unfound] = useState<boolean | undefined>(undefined)
    const [searched_for_wcomponent, set_searched_for_wcomponent] = useState<WComponent | undefined>(undefined)

    const { id } = props
    const wcomponent = props.wcomponent || searched_for_wcomponent

    const display_type: DisplayType = !props.ready ? DisplayType.loading
        : props.sub_route === "wcomponents_edit_multiple" ? DisplayType.edit_multiple
        : id === null ? DisplayType.no_id
        : wcomponent ? DisplayType.wcomponent_present : DisplayType.no_wcomponent_present


    function clear_old_wcomponent_from_other_base ()
    {
        if (id && wcomponent && wcomponent.id !== id)
        {
            set_searching_for_unfound(undefined)
            set_searched_for_wcomponent(undefined)
        }
    }


    function look_for_wcomponent_in_any_base ()
    {
        if (display_type === DisplayType.no_wcomponent_present && searching_for_unfound === undefined && id !== null)
        {
            (async () => {
                let component_form_closed = false

                set_searching_for_unfound(true)
                const result = await search_for_wcomponent_in_all_bases(id)
                if (component_form_closed) return

                set_searching_for_unfound(false)
                set_searched_for_wcomponent(result.wcomponent)

                return () => {
                    component_form_closed = true
                }
            })()
        }
    }

    useEffect(clear_old_wcomponent_from_other_base, [wcomponent, id])
    useEffect(look_for_wcomponent_in_any_base, [display_type, searching_for_unfound, id])


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


    if (display_type === DisplayType.wcomponent_present)
    {
        const wcomponent_from_different_base = !props.wcomponent && !!searched_for_wcomponent
        return <WComponentForm wcomponent={wcomponent!} wcomponent_from_different_base={wcomponent_from_different_base} />
    }


    return <div>
        Component not found for id: {id}

        <br />
        <br />

        {searching_for_unfound && <div>Searching in other bases...</div>}
        {!searching_for_unfound && <div>Not found in other bases (that you have access to).</div>}
    </div>
}


export const WComponentsSidePanel = connector(_WComponentsSidePanel) as FunctionComponent<OwnProps>



enum DisplayType {
    loading,
    edit_multiple,
    no_id,
    no_wcomponent_present,
    wcomponent_present,
}



function search_for_wcomponent_in_all_bases (wcomponent_id: string)
{
    const supabase = get_supabase()
    return supabase_get_wcomponent_from_any_base({ supabase, id: wcomponent_id })
}
