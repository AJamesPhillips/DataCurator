import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { get_perception_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { PerceptionForm } from "./PerceptionForm"
import { PerceptionsList } from "./PerceptionsList"



interface OwnProps {}

const map_state = (state: RootState) =>
{
    const { ready_for_reading: ready } = state.sync
    const id = state.routing.item_id
    const perception = get_perception_from_state(state, id)

    return { ready, id, perception }
}


const connector = connect(map_state)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _PerceptionsSidePanel (props: Props)
{
    if (!props.ready) return <div>Loading...</div>


    if (!props.id) return <div>
        {/* <CreateNewPerception /> */}

        <p>
            Or select a perception to view
        </p>

        <PerceptionsList />
    </div>


    if (!props.perception) return <div>Perception not found for id: {props.id}</div>


    return <PerceptionForm perception={props.perception} />
}


export const PerceptionsSidePanel = connector(_PerceptionsSidePanel) as FunctionComponent<OwnProps>
