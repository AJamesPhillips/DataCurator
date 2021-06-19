import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"



const map_state = (state: RootState) => ({
    apply_filter: state.filter_context.apply_filter,
})

const map_dispatch = {
    set_apply_filter: ACTIONS.filter_context.set_apply_filter,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>


function _FilterContextTabTitle (props: Props)
{
    return <div>
        Filter
        <input
            type="checkbox"
            style={{ margin: "-3px 0 0 5px" }}
            checked={props.apply_filter}
            onClick={e =>
            {
                e.stopPropagation()
                e.preventDefault()
            }}
            onPointerDown={e =>
            {
                e.stopPropagation()
                e.preventDefault()
                props.set_apply_filter(!props.apply_filter)
            }}
        />
    </div>
}

export const FilterContextTabTitle = connector(_FilterContextTabTitle) as FunctionalComponent<{}>
