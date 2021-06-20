import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { EditableCheckbox } from "../form/EditableCheckbox"

import { LabelsEditor } from "../labels/LabelsEditor"
import { ACTIONS } from "../state/actions"
import type { CompoundFilter } from "../state/filter_context/state"
import type { RootState } from "../state/State"
import { get_excluded_label_ids } from "./utils"



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
    const exclude_label_ids = get_excluded_label_ids(props.filters)


    return <div>
        <h3>Filters</h3>

        <p>
            Enabled: <EditableCheckbox
                value={props.apply_filter}
                on_change={() => props.set_apply_filter(!props.apply_filter)}
            />
        </p>

        <p>
            Exclude by label:

            <LabelsEditor
                label_ids={exclude_label_ids}
                on_change={new_exclude_label_ids =>
                {
                    const filters = get_exclusion_filters_from_ids(new_exclude_label_ids)
                    props.set_filters({ filters })
                }}
                always_allow_editing={true}
            />
        </p>
    </div>
}

export const FiltersSidePanel = connector(_FiltersSidePanel) as FunctionalComponent<{}>



function get_exclusion_filters_from_ids (label_ids: string[]): CompoundFilter[]
{
    if (label_ids.length === 0) return []

    return [
        { type: "compound", operator: "OR", operation: "exclude", filters:
            [
                { type: "specific", label_ids, search_term: "", component_types: [] },
            ]
        },
    ]
}
