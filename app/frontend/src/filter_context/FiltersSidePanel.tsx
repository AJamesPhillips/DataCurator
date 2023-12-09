import { FunctionalComponent, h } from "preact"
import { useMemo } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { MultiAutocompleteText } from "../form/Autocomplete/MultiAutocompleteText"
import { EditableCheckbox } from "../form/EditableCheckbox"
import { LabelsEditor } from "../labels/LabelsEditor"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { wcomponent_type_to_text } from "../wcomponent_derived/wcomponent_type_to_text"
import { get_is_on_actions_list_view } from "../state/actions_list_view/accessors"
import { EditableTextSingleLine } from "../form/editable_text/EditableTextSingleLine"
import { EditableTextOnBlurType } from "../form/editable_text/editable_text_common"



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
        is_on_actions_list_view: get_is_on_actions_list_view(state),
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
                editing_allowed={true}
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
                editing_allowed={true}
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
                editing_allowed={true}
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
                editing_allowed={true}
            />
        </p>


        {props.is_on_actions_list_view && <>
            <br />
            <hr />

            <h3>Actions list filters</h3>

            <p>
                Filter by current knowledge view: <EditableCheckbox
                    value={props.filters.filter_by_current_knowledge_view}
                    on_change={() =>
                    {
                        const filters = {
                            ...props.filters,
                            filter_by_current_knowledge_view: !props.filters.filter_by_current_knowledge_view,
                        }
                        props.set_filters({ filters })
                    }}
                />
            </p>

            <p>
                Filter by text: <EditableTextSingleLine
                    size="small"
                    placeholder=""
                    editing_allowed={true}
                    value={props.filters.filter_by_text}
                    on_blur={filter_by_text =>
                    {
                        const filters = {
                            ...props.filters,
                            filter_by_text: filter_by_text.trim(),
                        }
                        props.set_filters({ filters })
                    }}
                    on_blur_type={EditableTextOnBlurType.conditional}
                />
            </p>
        </>}


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
