import { FunctionalComponent, h } from "preact"
import { useMemo } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { MultiAutocompleteText } from "../form/Autocomplete/MultiAutocompleteText"
import { EditableCheckbox } from "../form/EditableCheckbox"
import { LabelsEditor } from "../labels/LabelsEditor"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { wcomponent_type_to_text } from "../wcomponent_derived/wcomponent_type_to_text"



const map_state = (state: RootState) =>
{
    const {
        wc_label_ids,
        wc_types,
    } = state.derived.current_composed_knowledge_view?.available_filter_options || {}

    return {
        wc_label_ids,
        wc_types,
        apply_filter: state.filter_context.apply_filter,
        filters: state.filter_context.filters,
    }
}


const map_dispatch = {
    set_apply_filter: ACTIONS.filter_context.set_apply_filter,
    set_filters: ACTIONS.filter_context.set_filters,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _FiltersSidePanel (props: Props)
{
    const { wc_label_ids, wc_types } = props

    const wcomponent_type_options = useMemo(() =>
    {
        return (wc_types || []).map(type => ({ id: type, title: wcomponent_type_to_text(type) }))
    }, [wc_types])


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
                allowed_label_ids={wc_label_ids}
                label_ids={props.filters.exclude_by_label_ids}
                on_change={exclude_by_label_ids =>
                {
                    props.set_filters({ filters: { ...props.filters, exclude_by_label_ids } })
                }}
                force_editable={true}
            />
        </p>


        <p>
            Filter (include) by label:

            <LabelsEditor
                allowed_label_ids={wc_label_ids}
                label_ids={props.filters.include_by_label_ids}
                on_change={include_by_label_ids =>
                {
                    props.set_filters({ filters: { ...props.filters, include_by_label_ids } })
                }}
                force_editable={true}
            />
        </p>


        <p>
            Exclude by component type:

            <MultiAutocompleteText
                placeholder=""
                selected_option_ids={props.filters.exclude_by_component_types}
                options={wcomponent_type_options}
                allow_none={true}
                on_change={exclude_by_component_types =>
                {
                    props.set_filters({ filters: { ...props.filters, exclude_by_component_types } })
                }}
                force_editable={true}
            />
        </p>


        <p>
            Filter (include) by component type:

            <MultiAutocompleteText
                placeholder=""
                selected_option_ids={props.filters.include_by_component_types}
                options={wcomponent_type_options}
                allow_none={true}
                on_change={include_by_component_types =>
                {
                    props.set_filters({ filters: { ...props.filters, include_by_component_types } })
                }}
                force_editable={true}
            />
        </p>
    </div>
}

export const FiltersSidePanel = connector(_FiltersSidePanel) as FunctionalComponent<{}>
