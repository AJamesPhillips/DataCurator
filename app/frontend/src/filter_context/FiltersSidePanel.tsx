import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { LabelsEditor } from "../labels/LabelsEditor"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"



const map_state = (state: RootState) => ({
    apply_filter: state.filter_context.apply_filter,
    filters: state.filter_context.filters,
})

const map_dispatch = {
    set_apply_filter: ACTIONS.filter_context.set_apply_filter,
    set_filters: ACTIONS.filter_context.set_filters,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _FiltersSidePanel (props: Props)
{
    const first_compound_filter = props.filters[0]
    const filters = !first_compound_filter ? [] : first_compound_filter.filters
    const first_specific_filter = (filters[0] && filters[0].type === "specific") ? filters[0] : undefined
    const label_ids: string[] = !first_specific_filter ? [] : first_specific_filter.label_ids


    const include = !!first_compound_filter && first_compound_filter.operation === "include"
    const exclude_label_ids: string[] = !include ? label_ids : []
    const include_label_ids: string[] = include ? label_ids : []

    return <div>
        <h3>Filters</h3>

        <p>
            <b>Exclude by label</b>

            <LabelsEditor
                label_ids={exclude_label_ids}
                on_change={() => {}}
            />
        </p>
    </div>
}

export const FiltersSidePanel = connector(_FiltersSidePanel) as FunctionalComponent<{}>
