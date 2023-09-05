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

    // // The use of the get_available_filter_options function and this whole
    // // block of code smells and should instead be refactored and modify:
    // // `state.derived.current_composed_knowledge_view.available_filter_options`
    // if (get_is_on_actions_list_view(state))
    // {
    //     const action_ids = get_action_ids_for_actions_list_view(state)
    //     const actions = get_wcomponents_from_ids(state.specialised_objects.wcomponents_by_id, action_ids)
    //         .filter(wcomponent_is_action)

    //     ;({ wc_label_ids, wc_types } = get_available_filter_options(actions))
    // }

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
    const { wc_label_ids, wc_types, filters } = props

    const wcomponent_exclude_type_options = useMemo(() =>
    {
        const all_exclude_types = ([...(wc_types || [])])
            .concat(filters.exclude_by_component_types)

        return all_exclude_types.map(type => ({ id: type, title: wcomponent_type_to_text(type) }))
    }, [wc_types, filters])


    const wcomponent_include_type_options = useMemo(() =>
    {
        const all_include_types = ([...(wc_types || [])])
            .concat(filters.include_by_component_types)

        return all_include_types.map(type => ({ id: type, title: wcomponent_type_to_text(type) }))
    }, [wc_types, filters])


    return <div>
        <p>
            Enabled: <EditableCheckbox
                value={props.apply_filter}
                on_change={() => props.set_apply_filter(!props.apply_filter)}
            />
        </p>


        <p>
            Filter by label:

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
            Filter by component type:

            <MultiAutocompleteText
                placeholder=""
                selected_option_ids={props.filters.include_by_component_types}
                options={wcomponent_include_type_options}
                allow_none={true}
                on_change={include_by_component_types =>
                {
                    props.set_filters({ filters: { ...props.filters, include_by_component_types } })
                }}
                force_editable={true}
            />
        </p>


        <p>
            Exclude by component type:

            <MultiAutocompleteText
                placeholder=""
                selected_option_ids={props.filters.exclude_by_component_types}
                options={wcomponent_exclude_type_options}
                allow_none={true}
                on_change={exclude_by_component_types =>
                {
                    props.set_filters({ filters: { ...props.filters, exclude_by_component_types } })
                }}
                force_editable={true}
            />
        </p>


        {/*
            MAYBE DO: Build an advanced search that allows user to use AND
                instead of OR filters.
            MAYBE DO: Then extend advanced search to allow user to build nested
                queries.
        */}


        {/* <p>
            Filter actions to yours:

            <EditableCheckbox
                value={true}
                on_change={() => {}}
            />
        </p> */}
    </div>
}

export const FiltersSidePanel = connector(_FiltersSidePanel) as FunctionalComponent<{}>
