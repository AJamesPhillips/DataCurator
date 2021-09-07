import { h } from "preact"
import { useState } from "preact/hooks"
import Box from "@material-ui/core/Box"

import {
    EditableListEntryTopProps,
    EditableListEntry,
    ListItemCRUD,
} from "../../form/editable_list/EditableListEntry"
import { get_items_descriptor, ExpandableList } from "../../form/editable_list/ExpandableList"
import type { ExpandableListContentProps } from "../../form/editable_list/interfaces"
import { ListHeader } from "../../form/editable_list/ListHeader"
import { ListHeaderAddButton } from "../../form/editable_list/ListHeaderAddButton"
import { NewItemForm } from "../../form/editable_list/NewItemForm"
import type { CreationContextState } from "../../shared/creation_context/state"
import type { VAP_set_id_counterfactual_map } from "../../shared/uncertainty/uncertainty"
import { Tense } from "../../shared/wcomponent/interfaces/datetime"
import { VAPsType } from "../../shared/wcomponent/interfaces/generic_value"
import type { StateValueAndPredictionsSet as VAPSet } from "../../shared/wcomponent/interfaces/state"
import { get_created_at_datetime } from "../../shared/wcomponent/utils_datetime"
import { replace_element, remove_from_list_by_predicate } from "../../utils/list"
import {
    get_summary_for_single_VAP_set,
    get_details_for_single_VAP_set,
    get_details2_for_single_VAP_set,
} from "./common"
import { new_value_and_prediction_set } from "./NewValueAndPredictionSet"
import { prepare_new_VAP_set } from "./utils"
import { ValueAndPredictionSetOlderVersions } from "./ValueAndPredictionSetOlderVersions"



interface OwnProps
{
    wcomponent_id: string
    VAP_set_counterfactuals_map?: VAP_set_id_counterfactual_map

    item_descriptor: string
    VAPs_represent: VAPsType
    update_items: (items: VAPSet[]) => void

    values_and_prediction_sets: VAPSet[]
    invalid_future_items: VAPSet[]
    past_items: VAPSet[]
    present_items: VAPSet[]
    future_items: VAPSet[]
    previous_versions_by_id: {[id: string]: VAPSet[]}

    creation_context: CreationContextState
    editing: boolean
}


export function ValueAndPredictionSetsComponent (props: OwnProps)
{
    const [new_item, set_new_item] = useState<VAPSet | undefined>(undefined)

    const {
        wcomponent_id, VAP_set_counterfactuals_map,
        item_descriptor, values_and_prediction_sets, VAPs_represent,
        invalid_future_items, future_items, present_items, past_items, previous_versions_by_id,
        editing
    } = props


    const render_future_list_content = factory_render_list_content2({
        VAP_sets: future_items,
        previous_versions_by_id,
        all_VAP_sets: values_and_prediction_sets,
        update_items: props.update_items,
        wcomponent_id,
        VAP_set_counterfactuals_map,
        VAPs_represent,
        tense: Tense.future,
        creation_context: props.creation_context,
        editing,
    })

    const render_present_list_content = factory_render_list_content2({
        VAP_sets: present_items,
        previous_versions_by_id,
        all_VAP_sets: values_and_prediction_sets,
        update_items: props.update_items,
        wcomponent_id,
        VAP_set_counterfactuals_map,
        VAPs_represent,
        tense: Tense.present,
        creation_context: props.creation_context,
        editing,
    })

    const render_past_list_content = factory_render_list_content2({
        VAP_sets: past_items,
        previous_versions_by_id,
        all_VAP_sets: values_and_prediction_sets,
        update_items: props.update_items,
        wcomponent_id,
        VAP_set_counterfactuals_map,
        VAPs_represent,
        tense: Tense.past,
        creation_context: props.creation_context,
        editing,
    })


    const new_VAP_set_form_top_props: EditableListEntryTopProps<VAPSet> = {
        get_created_at: v => v.created_at,
        get_custom_created_at: v => v.custom_created_at,
        get_summary: new_value_and_prediction_set(VAPs_represent),
        get_details: () => <div />, // get_details_for_single_VAP_set(VAPs_represent),
        get_details2: () => <div />, // get_details2_for_single_VAP_set(VAPs_represent, editing),
        extra_class_names: `value_and_prediction_set new`
    }


    const title = editing
        ? get_items_descriptor(item_descriptor, values_and_prediction_sets.length, editing)
        : item_descriptor


    const show_futures = editing || future_items.length > 0
    const show_presents = editing || present_items.length > 0
    const show_pasts = editing || past_items.length > 0


    return <div className="value_and_prediction_sets">
        <ListHeader
            items_descriptor={title}
            on_click_header={undefined}
            other_content={() => !editing ? null : <ListHeaderAddButton
                new_item_descriptor={item_descriptor}
                on_pointer_down_new_list_entry={() =>
                {
                    const new_VAP_set = prepare_new_VAP_set(VAPs_represent, values_and_prediction_sets, props.creation_context)
                    set_new_item(new_VAP_set)
                }}
            />}
        />

        <NewItemForm
            new_item={new_item}
            set_new_item={set_new_item}
            item_top_props={new_VAP_set_form_top_props}
            item_descriptor={item_descriptor}
            add_item={new_item =>
            {
                props.update_items([...values_and_prediction_sets, new_item])
                set_new_item(undefined)
            }}
        />

        {invalid_future_items.length > 0 && <div>
            Hidden ({invalid_future_items.length})
        </div>}

        {show_futures && <ExpandableList
            content={render_future_list_content}
            item_descriptor=""
            items_descriptor={count_and_versions("Future", future_items, previous_versions_by_id, editing)}
            disable_collapsed={true}
        />}

        {(show_futures || show_presents) && <hr />}

        {show_presents && <ExpandableList
            content={render_present_list_content}
            item_descriptor=""
            items_descriptor={count_and_versions("Present", present_items, previous_versions_by_id, editing)}
            disable_collapsed={true}
        />}

        {show_presents && show_pasts && <hr />}

        {show_pasts && <ExpandableList
            content={render_past_list_content}
            item_descriptor=""
            items_descriptor={count_and_versions("Past", past_items, previous_versions_by_id, editing)}
            disable_collapsed={true}
        />}
    </div>
}



// TODO reintegrate this warning function for development work
function validate_VAP_sets_for_VAPs_represent (VAP_sets: VAPSet[], VAPs_represent: VAPsType): VAPSet[]
{
    if (VAPs_represent === VAPsType.boolean)
    {
        VAP_sets.map(VAP_set =>
        {
            const count = VAP_set.entries.length
            if (count !== 1)
            {
                console.warn(`VAP_set.id "${VAP_set.id}" - Expected one value for VAP_set.entries but got "${count}"`)
            }
        })
    }

    return VAP_sets
}



function count_and_versions (title: string, all_latest: {id: string}[], previous_versions_by_id: {[id: string]: {}[]}, editing: boolean)
{
    if (!editing) return title

    let previous_version_count = 0
    all_latest.forEach(({ id }) => previous_version_count += ((previous_versions_by_id[id] || []).length))

    if (previous_version_count === 0)
    {
        return get_items_descriptor(title, all_latest.length, editing)
    }

    return `${title} (${all_latest.length} (${all_latest.length + previous_version_count}))`
}



interface FactoryRenderListContentArgs <U>
{
    VAP_sets: U[]
    previous_versions_by_id: {[id: string]: U[]},
    all_VAP_sets: U[]
    update_items: (items: U[]) => void
    wcomponent_id: string
    VAP_set_counterfactuals_map?: VAP_set_id_counterfactual_map
    VAPs_represent: VAPsType
    tense: Tense
    creation_context: CreationContextState
    editing: boolean
}
function factory_render_list_content2 (args: FactoryRenderListContentArgs<VAPSet>)
{
    const { VAP_sets, previous_versions_by_id, all_VAP_sets, update_items, VAPs_represent, tense, editing } = args

    const render_list_content = (list_content_props: ExpandableListContentProps) =>
    {
        const {
            disable_partial_collapsed,
            expanded_items,
            expanded_item_rows,
        } = list_content_props

        return <div
            style={{ display: expanded_items ? "" : "none", cursor: "initial" }}
            onClick={e => e.stopPropagation()}
        >
            {VAP_sets.map(item => <div key={item.id}>
                <hr className="entries_horizontal_dividers" />
                <EditableListEntry
                    item={item}
                    get_created_at={item => item.created_at}
                    get_custom_created_at={get_created_at_datetime}

                    get_summary={get_summary_for_single_VAP_set(VAPs_represent, false)}
                    get_details={get_details_for_single_VAP_set(VAPs_represent)}
                    get_details2={get_details2_for_single_VAP_set(VAPs_represent, editing)}
                    get_details3={get_details3(VAPs_represent, previous_versions_by_id)}

                    extra_class_names={`value_and_prediction_set ${tense === Tense.future ? "future" : (tense === Tense.present ? "present" : "past")}`}

                    expanded={expanded_item_rows}
                    disable_collapsable={disable_partial_collapsed}
                    create_item={item =>
                    {
                        update_items([...VAP_sets, item])
                    }}
                    update_item={modified_VAP_set =>
                    {
                        const predicate = predicate_by_id(modified_VAP_set)
                        const updated_VAP_sets = replace_element(all_VAP_sets, modified_VAP_set, predicate)
                        update_items(updated_VAP_sets)
                    }}
                    delete_button_text="Delete Set of Value &amp; Predictions"
                    delete_item={() =>
                    {
                        update_items(remove_from_list_by_predicate(all_VAP_sets, predicate_by_id(item)))
                    }}
                />
            </div>
            )}
        </div>
    }

    return render_list_content
}



const predicate_by_id = (i1: VAPSet) => (i2: VAPSet) => {
    // Can not use `get_created_at_ms` in case the user sets or changes the custom datetime
    return i1.id === i2.id && (i1.created_at.getTime()) === (i2.created_at.getTime())
}



const get_details3 = (VAPs_represent: VAPsType, previous_versions_by_id: {[id: string]: VAPSet[]}) => (latest_VAP_set: VAPSet, crud: ListItemCRUD<VAPSet>): h.JSX.Element =>
{
    return <Box className="VAP_set_details">
        <br />

        <ValueAndPredictionSetOlderVersions
            VAPs_represent={VAPs_represent}
            current_VAP_set={latest_VAP_set}
            older_VAP_sets={previous_versions_by_id[latest_VAP_set.id] || []}
            create_item={crud.create_item}
            update_item={crud.update_item}
            delete_item={crud.delete_item}
        />
        <br />

        <br />
    </Box>
}
