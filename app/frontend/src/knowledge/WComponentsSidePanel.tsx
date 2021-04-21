import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { get_wcomponent_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { CreateNewWComponent } from "./CreateNewWComponent"
import { WComponentForm } from "./wcomponent_form/WComponentForm"
import { WComponentMultipleForm } from "./WComponentMultipleForm"
import { WComponentsList } from "./WComponentsList"



interface OwnProps {}

const map_state = (state: RootState) =>
{
    const ready = state.sync.ready
    const sub_route = state.routing.sub_route
    const id = state.routing.item_id
    const wcomponent = get_wcomponent_from_state(state, id)

    return { ready, sub_route, id, wcomponent }
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

        <p>
            Or select a component to view
        </p>

        <WComponentsList />
    </div>


    if (!props.wcomponent) return <div>Component not found for id: {props.id}</div>


    return <WComponentForm wcomponent={props.wcomponent} />
}


export const WComponentsSidePanel = connector(_WComponentsSidePanel) as FunctionComponent<OwnProps>
