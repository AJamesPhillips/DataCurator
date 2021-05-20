import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { ACTIONS } from "../state/actions"

import type { RootState } from "../state/State"



const map_state = (state: RootState) => ({
    use_creation_context: state.creation_context.use_creation_context,
})

const map_dispatch = {
    toggle_use_creation_context: ACTIONS.creation_context.toggle_use_creation_context,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>


function _CreationContextTabTitle (props: Props)
{
    return <div>
        Creation Context
        <input
            type="checkbox"
            style={{ margin: "-3px 0 0 5px" }}
            checked={props.use_creation_context}
            onClick={e =>
            {
                e.stopPropagation()
                e.preventDefault()
            }}
            onPointerDown={e =>
            {
                e.stopPropagation()
                e.preventDefault()
                props.toggle_use_creation_context()
            }}
        />
    </div>
}

export const CreationContextTabTitle = connector(_CreationContextTabTitle) as FunctionalComponent<{}>
