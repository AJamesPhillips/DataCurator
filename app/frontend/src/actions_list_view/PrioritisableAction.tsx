import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { WComponentCanvasNode } from "../wcomponent_canvas/node/WComponentCanvasNode"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import type { WComponentNodeAction } from "../wcomponent/interfaces/action"



interface OwnProps
{
    action: WComponentNodeAction
}



const map_state = (state: RootState) => ({
    editing: !state.display_options.consumption_formatting,
})


const map_dispatch = {
    upsert_wcomponent: ACTIONS.specialised_object.upsert_wcomponent,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps




function _PrioritisableAction (props: Props)
{
    const { action } = props

    return <div style={{ display: "flex", margin: 10 }}>
        <WComponentCanvasNode id={action.id} is_movable={false} always_show={true} />
    </div>
}

export const PrioritisableAction = connector(_PrioritisableAction) as FunctionalComponent<OwnProps>
