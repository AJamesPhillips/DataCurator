import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { get_wcomponent_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { CreateNewWComponent } from "./CreateNewWComponent"
import { WComponentForm } from "./wcomponent_form/WComponentForm"
import { WComponentMultipleForm } from "./WComponentMultipleForm"
import { WComponentsList } from "./WComponentsList"
import { LinkButton } from "../utils/Link"



interface OwnProps {}

const map_state = (state: RootState) =>
{
    const ready = state.sync.ready
    const sub_route = state.routing.sub_route
    const id = state.routing.item_id
    const wcomponent = get_wcomponent_from_state(state, id)
    const selected_ids = state.meta_wcomponents.selected_wcomponent_ids_list

    return { ready, sub_route, id, wcomponent, selected_ids }
}


const connector = connect(map_state)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _WComponentsSidePanel (props: Props)
{
    if (!props.ready) return <div>Loading...</div>


    if (props.sub_route === "wcomponents_edit_multiple") return <div>
        <WComponentMultipleForm />
    </div>


    if (!props.id) return <div>
        <CreateNewWComponent />

        <hr />

        {props.selected_ids.length > 0 && <p>
            <LinkButton
                name={`View ${props.selected_ids.length} component(s) already selected`}
                route="wcomponents"
                sub_route={props.selected_ids.length > 1 ? "wcomponents_edit_multiple" : undefined}
                item_id={props.selected_ids.length === 1 ? props.selected_ids[0] : undefined}
                args={undefined}
            />
        </p>}

        <p>
            Or select a component to view
        </p>

        <WComponentsList />
    </div>


    if (!props.wcomponent) return <div>Component not found for id: {props.id}</div>


    return <WComponentForm wcomponent={props.wcomponent} />
}


export const WComponentsSidePanel = connector(_WComponentsSidePanel) as FunctionComponent<OwnProps>
