import Box from "@mui/material/Box"
import { h } from "preact"
import { useState } from "preact/hooks"

import {
    EditableListEntry,
    EditableListEntryItemProps,
    ListItemCRUDRequiredCU,
    ListItemCRUDRequiredCUD,
} from "../../form/editable_list/EditableListEntry"
import { ExpandableList, get_items_descriptor } from "../../form/editable_list/ExpandableList"
import type { ExpandableListContentProps } from "../../form/editable_list/interfaces"
import { ListHeaderAddButton } from "../../form/editable_list/ListHeaderAddButton"
import { NewItemForm } from "../../form/editable_list/NewItemForm"
import { ActiveCreatedAtFilterWarning } from "../../sharedf/ActiveCreatedAtFilterWarning"
import { remove_element, replace_element } from "../../utils/list"
import { prepare_new_VAP_set } from "../../wcomponent/CRUD_helpers/prepare_new_VAP_set"
import { Tense } from "../../wcomponent/interfaces/datetime"
import type { ValuePossibilitiesById } from "../../wcomponent/interfaces/possibility"
import type {
    StateValueAndPredictionsSet as VAPSet,
} from "../../wcomponent/interfaces/state"
import type { VAPsType } from "../../wcomponent/interfaces/VAPsType"
import {
    get_details2_for_single_VAP_set,
    get_details_for_single_VAP_set,
    get_summary_for_single_VAP_set,
} from "./common"
import { new_value_and_prediction_set__jsx_factory } from "./NewValueAndPredictionSet"
import { ValueAndPredictionSetOlderVersions } from "./ValueAndPredictionSetOlderVersions"



interface OwnProps
{
    wcomponent_id: string

    VAPs_represent: VAPsType
    update_values_and_predictions: (updated_VAP_sets: VAPSet[]) => void

    existing_value_possibilities: ValuePossibilitiesById | undefined

    values_and_prediction_sets: VAPSet[]
    invalid_future_items: VAPSet[]
    past_items: VAPSet[]
    present_item: VAPSet | undefined
    future_items: VAPSet[]
    previous_versions_by_id: {[id: string]: VAPSet[]}

    base_id: number
    editing: boolean
}


// TODO maybe merge this component into _ValueAndPredictionSets as this is the
// only place that it is used.
export function ValueAndPredictionSetsComponent (props: OwnProps)
{
    const [new_item, set_new_item] = useState<VAPSet | undefined>(undefined)

    const {
        wcomponent_id,
        VAPs_represent, update_values_and_predictions,
        existing_value_possibilities,
        values_and_prediction_sets: all_VAP_sets, invalid_future_items, future_items, present_item, past_items, previous_versions_by_id,
        editing
    } = props
    const present_items = present_item ? [present_item] : []


    const render_future_list_content = factory_render_VAP_set_list_content({
        existing_value_possibilities,
        subset_VAP_sets: future_items,
        previous_versions_by_id,
        all_VAP_sets,
        update_values_and_predictions,
        wcomponent_id,
        VAPs_represent,
        tense: Tense.future,
        editing,
    })

    const render_present_list_content = factory_render_VAP_set_list_content({
        existing_value_possibilities,
        subset_VAP_sets: present_items,
        previous_versions_by_id,
        all_VAP_sets,
        update_values_and_predictions,
        wcomponent_id,
        VAPs_represent,
        tense: Tense.present,
        editing,
    })

    const render_past_list_content = factory_render_VAP_set_list_content({
        existing_value_possibilities,
        subset_VAP_sets: past_items,
        previous_versions_by_id,
        all_VAP_sets,
        update_values_and_predictions,
        wcomponent_id,
        VAPs_represent,
        tense: Tense.past,
        editing,
    })


    const possible_value_possibilities = existing_value_possibilities // update_value_possibilities_with_VAPSets(existing_value_possibilities, all_VAP_sets)

    const new_VAP_set_form_item_props: EditableListEntryItemProps<VAPSet, ListItemCRUDRequiredCU<VAPSet>> = {
        get_created_at: get_actual_created_at_datetime,
        get_custom_created_at: get_actual_custom_created_at_datetime,
        get_summary: new_value_and_prediction_set__jsx_factory(VAPs_represent, possible_value_possibilities),
        get_details: () => <div />, // get_details_for_single_VAP_set(VAPs_represent),
        get_details2: () => <div />, // get_details2_for_single_VAP_set(VAPs_represent, editing),
        extra_class_names: `value_and_prediction_set new`,
        crud: {
            create_item: new_VAP_set =>
            {
                const updated_VAP_sets = [...all_VAP_sets, new_VAP_set]
                update_values_and_predictions(updated_VAP_sets)
                set_new_item(undefined)
            },
            update_item: set_new_item,
        },
    }


    const item_descriptor = "Value Prediction"


    const show_futures = editing || future_items.length > 0
    const show_presents = editing || present_items.length > 0
    const show_pasts = editing || past_items.length > 0


    return <div className="value_and_prediction_sets">
        {editing && <ListHeaderAddButton
            new_item_descriptor={item_descriptor}
            on_pointer_down_new_list_entry={() =>
            {
                const new_VAP_set = prepare_new_VAP_set(VAPs_represent, existing_value_possibilities, all_VAP_sets, props.base_id)
                set_new_item(new_VAP_set)
            }}
        />}

        <NewItemForm
            new_item={new_item}
            set_new_item={set_new_item}
            item_props={new_VAP_set_form_item_props}
            item_descriptor={item_descriptor}
        />

        {invalid_future_items.length > 0 && <div>
            Hidden ({invalid_future_items.length}) <ActiveCreatedAtFilterWarning />
        </div>}

        {show_futures && <ExpandableList
            content={render_future_list_content}
            item_descriptor=""
            items_descriptor={count_and_versions("Future", future_items, previous_versions_by_id, editing)}
            items_descriptor_title={count_and_versions_title("Future", future_items, previous_versions_by_id)}
            disable_collapsed={true}
        />}

        {(show_futures || show_presents) && <hr />}

        {show_presents && <ExpandableList
            content={render_present_list_content}
            item_descriptor=""
            items_descriptor={count_and_versions("Present", present_items, previous_versions_by_id, editing)}
            items_descriptor_title={count_and_versions_title("Present", present_items, previous_versions_by_id)}
            disable_collapsed={true}
        />}

        {show_presents && show_pasts && <hr />}

        {show_pasts && <ExpandableList
            content={render_past_list_content}
            item_descriptor=""
            items_descriptor={count_and_versions("Past", past_items, previous_versions_by_id, editing)}
            items_descriptor_title={count_and_versions_title("Past", past_items, previous_versions_by_id)}
            disable_collapsed={true}
        />}
    </div>
}



/* TODO reintegrate this warning function for development work
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
*/


function count_and_versions (title: string, all_latest: {id: string}[], previous_versions_by_id: {[id: string]: object[]}, editing: boolean)
{
    if (!editing) return title

    let previous_version_count = 0
    all_latest.forEach(({ id }) => previous_version_count += ((previous_versions_by_id[id] || []).length))

    if (previous_version_count === 0)
    {
        return get_items_descriptor(title, all_latest.length, editing)
    }

    return `${title} (${all_latest.length}+)`
    // return `${title} (${all_latest.length} & older)`
    // return `${title} (${all_latest.length} +${previous_version_count} older)`
}

function count_and_versions_title (title: string, all_latest: {id: string}[], previous_versions_by_id: {[id: string]: object[]})
{
    let previous_version_count = 0
    all_latest.forEach(({ id }) => previous_version_count += ((previous_versions_by_id[id] || []).length))

    if (previous_version_count === 0)
    {
        return `${all_latest.length} ${title} items`
    }

    return `${all_latest.length} ${title} items with ${previous_version_count} older versions`
}



interface FactoryRenderListContentArgs <U>
{
    existing_value_possibilities: ValuePossibilitiesById | undefined
    subset_VAP_sets: U[]
    all_VAP_sets: U[]
    previous_versions_by_id: {[id: string]: U[]},
    update_values_and_predictions: (updated_VAP_sets: U[]) => void
    wcomponent_id: string
    VAPs_represent: VAPsType
    tense: Tense
    editing: boolean
}
function factory_render_VAP_set_list_content (args: FactoryRenderListContentArgs<VAPSet>)
{
    const {
        existing_value_possibilities, subset_VAP_sets, all_VAP_sets, previous_versions_by_id, update_values_and_predictions, VAPs_represent, tense, editing } = args

    const render_VAP_set_list_content = (list_content_props: ExpandableListContentProps) =>
    {
        const {
            disable_partial_collapsed,
            expanded_items,
            expanded_item_rows,
        } = list_content_props


        const crud: ListItemCRUDRequiredCUD<VAPSet> = {
            // create_item used for creating new versions
            create_item: item =>
            {
                const updated_VAP_sets = [...all_VAP_sets, item]
                update_values_and_predictions(updated_VAP_sets)
            },
            update_item: modified_VAP_set =>
            {
                const predicate = predicate_by_id_and_created_at(modified_VAP_set)
                const updated_VAP_sets = replace_element(all_VAP_sets, modified_VAP_set, predicate)
                update_values_and_predictions(updated_VAP_sets)
            },
            delete_item: item =>
            {
                const predicate = predicate_by_id_and_created_at(item)
                const updated_VAP_sets = remove_element(all_VAP_sets, predicate)
                update_values_and_predictions(updated_VAP_sets)
            },
        }


        return <div
            style={{ display: expanded_items ? "" : "none", cursor: "initial" }}
            onClick={e => e.stopPropagation()}
        >
            {subset_VAP_sets.map(item => <div key={item.id}>
                <hr className="entries_horizontal_dividers" />
                <EditableListEntry
                    item={item}
                    get_created_at={get_actual_created_at_datetime}
                    get_custom_created_at={get_actual_custom_created_at_datetime}

                    get_summary={get_summary_for_single_VAP_set(VAPs_represent, false)}
                    get_details={get_details_for_single_VAP_set(existing_value_possibilities, VAPs_represent)}
                    get_details2={get_details2_for_single_VAP_set(VAPs_represent, editing)}
                    get_details3={get_details3(existing_value_possibilities, VAPs_represent, previous_versions_by_id)}

                    extra_class_names={`value_and_prediction_set ${tense === Tense.future ? "future" : (tense === Tense.present ? "present" : "past")}`}

                    expanded={expanded_item_rows}
                    crud={crud}
                    delete_button_text="Delete Set of Value &amp; Predictions"
                />
            </div>
            )}
        </div>
    }

    return render_VAP_set_list_content
}


const get_actual_created_at_datetime = (item: VAPSet) => item.created_at
const get_actual_custom_created_at_datetime = (item: VAPSet) => item.custom_created_at


const predicate_by_id_and_created_at = (i1: VAPSet) => (i2: VAPSet) => {
    // Can not use `get_created_at_ms` in case the user sets or changes the custom datetime
    return i1.id === i2.id && (i1.created_at.getTime()) === (i2.created_at.getTime())
}



const get_details3 = (value_possibilities: ValuePossibilitiesById | undefined, VAPs_represent: VAPsType, previous_versions_by_id: {[id: string]: VAPSet[]}) => (latest_VAP_set: VAPSet, crud: ListItemCRUDRequiredCUD<VAPSet>): h.JSX.Element =>
{
    return <Box className="VAP_set_details">
        <br />

        <ValueAndPredictionSetOlderVersions
            value_possibilities={value_possibilities}
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
