import { h } from "preact"
import { useState } from "preact/hooks"

import { EditableListEntryTopProps, EditableListEntry } from "../../form/editable_list/EditableListEntry"
import { get_items_descriptor, ExpandableList } from "../../form/editable_list/ExpandableList"
import type { ExpandableListContentProps } from "../../form/editable_list/interfaces"
import { ListHeader } from "../../form/editable_list/ListHeader"
import { ListHeaderAddButton } from "../../form/editable_list/ListHeaderAddButton"
import { NewItemForm } from "../../form/editable_list/NewItemForm"
import { Tense } from "../../shared/wcomponent/interfaces/datetime"
import type { StateValueAndPredictionsSet, VersionedStateVAPsSet } from "../../shared/wcomponent/interfaces/state"
import type { VAP_set_id_counterfactual_map } from "../../shared/uncertainty/uncertainty"
import { group_VAP_sets_by_version, sort_grouped_VAP_sets, ungroup_VAP_sets_by_version } from "../../shared/wcomponent/value_and_prediction/utils"
import { test } from "../../shared/utils/test"
import { upsert_entry, remove_from_list_by_predicate } from "../../utils/list"
import { get_summary_for_single_VAP_set, get_details_for_single_VAP_set, get_details2_for_single_VAP_set } from "./common"
import { prepare_new_VAP_set } from "./utils"
import { ValueAndPredictionSetOlderVersions } from "./ValueAndPredictionSetOlderVersions"
import type { CreationContextState } from "../../shared/interfaces"
import type { VAPsRepresent } from "../../shared/wcomponent/interfaces/generic_value"



interface OwnProps
{
    wcomponent_id: string
    VAP_set_counterfactuals_map?: VAP_set_id_counterfactual_map

    item_descriptor: string
    values_and_prediction_sets: StateValueAndPredictionsSet[]
    VAPs_represent: VAPsRepresent
    update_items: (items: StateValueAndPredictionsSet[]) => void

    invalid_items: StateValueAndPredictionsSet[]
    past_items: StateValueAndPredictionsSet[]
    present_items: StateValueAndPredictionsSet[]
    future_items: StateValueAndPredictionsSet[]

    creation_context: CreationContextState
    editing: boolean
}


export function ValueAndPredictionSetsComponent (props: OwnProps)
{
    const [new_item, set_new_item] = useState<StateValueAndPredictionsSet | undefined>(undefined)

    const {
        wcomponent_id, VAP_set_counterfactuals_map,
        item_descriptor, values_and_prediction_sets, VAPs_represent,
        invalid_items, future_items, present_items, past_items, editing
    } = props


    const sorted_grouped_future_versioned_VAP_sets = validate_sort_and_group_VAP_sets_by_version(future_items, VAPs_represent)
    const sorted_grouped_present_versioned_VAP_sets = validate_sort_and_group_VAP_sets_by_version(present_items, VAPs_represent)
    const sorted_grouped_past_versioned_VAP_sets = validate_sort_and_group_VAP_sets_by_version(past_items, VAPs_represent)


    const render_future_list_content = factory_render_list_content2({
        all_VAP_sets: values_and_prediction_sets,
        grouped_versioned_VAP_sets: sorted_grouped_future_versioned_VAP_sets,
        update_items: props.update_items,
        wcomponent_id,
        VAP_set_counterfactuals_map,
        VAPs_represent,
        tense: Tense.future,
        creation_context: props.creation_context,
        editing,
    })

    const render_present_list_content = factory_render_list_content2({
        all_VAP_sets: values_and_prediction_sets,
        grouped_versioned_VAP_sets: sorted_grouped_present_versioned_VAP_sets,
        update_items: props.update_items,
        wcomponent_id,
        VAP_set_counterfactuals_map,
        VAPs_represent,
        tense: Tense.present,
        creation_context: props.creation_context,
        editing,
    })

    const render_past_list_content = factory_render_list_content2({
        all_VAP_sets: values_and_prediction_sets,
        grouped_versioned_VAP_sets: sorted_grouped_past_versioned_VAP_sets,
        update_items: props.update_items,
        wcomponent_id,
        VAP_set_counterfactuals_map,
        VAPs_represent,
        tense: Tense.past,
        creation_context: props.creation_context,
        editing,
    })


    const new_VAP_set_form_top_props: EditableListEntryTopProps<StateValueAndPredictionsSet> = {
        get_created_at: v => v.created_at,
        get_custom_created_at: v => v.custom_created_at,
        get_summary: get_summary_for_single_VAP_set(VAPs_represent, false, undefined),
        get_details: get_details_for_single_VAP_set(VAPs_represent),
        get_details2: get_details2_for_single_VAP_set(VAPs_represent, editing),
        extra_class_names: `value_and_prediction_set new`
    }


    return <div className="value_and_prediction_sets">
        <ListHeader
            items_descriptor={get_items_descriptor(item_descriptor, values_and_prediction_sets.length, editing)}
            on_click_header={undefined}
            other_content={() => !editing ? null : <ListHeaderAddButton
                new_item_descriptor={item_descriptor}
                on_pointer_down_new_list_entry={() => set_new_item(prepare_new_VAP_set(props.creation_context))}
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

        {invalid_items.length ? <div>
            Hidden ({invalid_items.length})
        </div> : null}

        <ExpandableList
            content={render_future_list_content}
            item_descriptor=""
            items_descriptor={count_and_versions("Future", sorted_grouped_future_versioned_VAP_sets, future_items, editing)}
            disable_collapsed={true}
        />

        <hr />

        <ExpandableList
            content={render_present_list_content}
            item_descriptor=""
            items_descriptor={count_and_versions("Present", sorted_grouped_present_versioned_VAP_sets, present_items, editing)}
            disable_collapsed={true}
        />

        <hr />

        <ExpandableList
            content={render_past_list_content}
            item_descriptor=""
            items_descriptor={count_and_versions("Past", sorted_grouped_past_versioned_VAP_sets, past_items, editing)}
            disable_collapsed={true}
        />
    </div>
}



function validate_sort_and_group_VAP_sets_by_version(values_and_prediction_sets: StateValueAndPredictionsSet[], VAPs_represent: VAPsRepresent)
{
    const VAP_sets = validate_VAP_sets_for_VAPs_represent(values_and_prediction_sets, VAPs_represent)
    const grouped_VAP_sets = group_VAP_sets_by_version(VAP_sets)
    const sorted_grouped_VAP_sets = sort_grouped_VAP_sets(grouped_VAP_sets)

    return sorted_grouped_VAP_sets
}



function validate_VAP_sets_for_VAPs_represent (VAP_sets: StateValueAndPredictionsSet[], VAPs_represent: VAPsRepresent): StateValueAndPredictionsSet[]
{
    if (VAPs_represent.boolean)
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



function count_and_versions (title: string, grouped_items: {}[], all_versions: {}[], editing: boolean)
{
    if (grouped_items.length === all_versions.length)
    {
        return get_items_descriptor(title, grouped_items.length, editing)
    }

    return `${title} (${grouped_items.length} (${all_versions.length}))`
}



interface FactoryRenderListContentArgs <U, V>
{
    grouped_versioned_VAP_sets: V[]
    all_VAP_sets: U[]
    update_items: (items: U[]) => void
    wcomponent_id: string
    VAP_set_counterfactuals_map?: VAP_set_id_counterfactual_map
    VAPs_represent: VAPsRepresent
    tense: Tense
    creation_context: CreationContextState
    editing: boolean
}
function factory_render_list_content2 (args: FactoryRenderListContentArgs<StateValueAndPredictionsSet, VersionedStateVAPsSet>)
{
    const { grouped_versioned_VAP_sets, all_VAP_sets, update_items, VAPs_represent, tense, editing } = args

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
            {grouped_versioned_VAP_sets.map(item => <div key={get_latest_id(item)}>
                <hr className="entries_horizontal_dividers" />
                <EditableListEntry
                    item={item}

                    get_created_at={get_latest_created_at}
                    get_custom_created_at={get_latest_custom_created_at}
                    set_custom_created_at={set_latest_custom_created_at}
                    get_summary={get_summary(VAPs_represent, args.VAP_set_counterfactuals_map)}
                    get_details={get_details(VAPs_represent, args.wcomponent_id, args.VAP_set_counterfactuals_map)}
                    get_details2={get_details2(VAPs_represent, editing)}
                    get_details3={get_details3(VAPs_represent, args.creation_context, editing)}
                    extra_class_names={`value_and_prediction_set ${tense === Tense.future ? "future" : (tense === Tense.present ? "present" : "past")}`}

                    expanded={expanded_item_rows}
                    disable_collapsable={disable_partial_collapsed}
                    on_change={factory_handle_change({ all_VAP_sets, item, update_items })}
                    delete_item={() =>
                    {
                        update_items(remove_from_list_by_predicate(all_VAP_sets, predicate_by_id(item.latest)))
                    }}
                />
            </div>
            )}
        </div>
    }

    return render_list_content
}



const predicate_by_id = (i1: StateValueAndPredictionsSet) => (i2: StateValueAndPredictionsSet) => {
    return i1.id === i2.id && i1.version === i2.version
}

const get_latest_id = (item: VersionedStateVAPsSet) => item.latest.id
const get_latest_created_at = (item: VersionedStateVAPsSet) => item.latest.created_at
const get_latest_custom_created_at = (item: VersionedStateVAPsSet) => item.latest.custom_created_at
const set_latest_custom_created_at = (item: VersionedStateVAPsSet, custom_created_at: Date | undefined): VersionedStateVAPsSet =>
{
    return { ...item, latest: { ...item.latest, custom_created_at } }
}


const get_summary = (VAPs_represent: VAPsRepresent, VAP_set_counterfactuals_map?: VAP_set_id_counterfactual_map) => (versioned_VAP_set: VersionedStateVAPsSet, on_change: (item: VersionedStateVAPsSet) => void): h.JSX.Element =>
{
    const { latest: latest_VAP_set, older } = versioned_VAP_set
    const VAP_counterfactuals_map = VAP_set_counterfactuals_map && VAP_set_counterfactuals_map[latest_VAP_set.id]

    return get_summary_for_single_VAP_set(VAPs_represent, false, VAP_counterfactuals_map)(latest_VAP_set, latest => on_change({ latest, older }))
}



const get_details = (VAPs_represent: VAPsRepresent, wcomponent_id: string, VAP_set_counterfactuals_map?: VAP_set_id_counterfactual_map) => (versioned_VAP_set: VersionedStateVAPsSet, on_change: (item: VersionedStateVAPsSet) => void): h.JSX.Element =>
{
    const { latest: latest_VAP_set, older } = versioned_VAP_set

    return get_details_for_single_VAP_set(VAPs_represent, wcomponent_id, VAP_set_counterfactuals_map)(latest_VAP_set, latest => on_change({ latest, older }))
}



const get_details2 = (VAPs_represent: VAPsRepresent, editing: boolean) => (versioned_VAP_set: VersionedStateVAPsSet, on_change: (item: VersionedStateVAPsSet) => void): h.JSX.Element =>
{
    const { latest: latest_VAP_set, older } = versioned_VAP_set

    return get_details2_for_single_VAP_set(VAPs_represent, editing)(latest_VAP_set, latest => on_change({ latest, older }))
}



const get_details3 = (VAPs_represent: VAPsRepresent, creation_context: CreationContextState, editing: boolean) => (versioned_VAP_set: VersionedStateVAPsSet, on_change: (item: VersionedStateVAPsSet) => void): h.JSX.Element =>
{
    return <div className="VAP_set_details">
        <br />

        <ValueAndPredictionSetOlderVersions
            VAPs_represent={VAPs_represent}
            versioned_VAP_set={versioned_VAP_set}
            update_versioned_VAP_set={on_change}
            creation_context={creation_context}
            editing={editing}
        />
        <br />

        <br />
    </div>
}



interface FactoryHandleChangeArgs
{
    all_VAP_sets: StateValueAndPredictionsSet[]
    item: VersionedStateVAPsSet
    update_items: (updated_VAP_sets: StateValueAndPredictionsSet[]) => void
}
function factory_handle_change (args: FactoryHandleChangeArgs): (item: VersionedStateVAPsSet) => void
{
    const {
        all_VAP_sets,
        item,
        update_items,
    } = args

    return (modified_item: VersionedStateVAPsSet) =>
    {
        let all_updated_VAP_sets = all_VAP_sets

        const original_VAP_sets = ungroup_VAP_sets_by_version([item])
        const VAP_sets_for_update = ungroup_VAP_sets_by_version([modified_item])


        // Remove older deleted versions
        original_VAP_sets.forEach(original_VAP_set =>
        {
            const predicate = predicate_by_id(original_VAP_set)
            const is_still_present = !!VAP_sets_for_update.find(predicate)
            if (!is_still_present)
            {
                all_updated_VAP_sets = remove_from_list_by_predicate(all_updated_VAP_sets, predicate)
            }
        })


        VAP_sets_for_update.forEach(modified_VAP_set =>
        {
            all_updated_VAP_sets = upsert_entry(all_updated_VAP_sets, modified_VAP_set, predicate_by_id(modified_VAP_set), "")
        })
        update_items(all_updated_VAP_sets)
    }
}



function run_tests ()
{
    console. log("running tests of factory_handle_change for ValueAndPredictionSetsComponent")
    // Test it handles delete of a nested older version

    const created_at = new Date("2021-04-30T10:51:06.041Z")
    const v1: StateValueAndPredictionsSet = {
        id: "vps20",
        version: 1,
        created_at,
        datetime: {},
        entries: []
    }
    const v2: StateValueAndPredictionsSet = {
        id: "vps20",
        version: 2,
        created_at,
        datetime: {},
        entries: []
    }
    const another_VAP_set: StateValueAndPredictionsSet = {
        id: "vps10",
        version: 1,
        created_at,
        datetime: {},
        entries: []
    }
    const all_VAP_sets = [ v1, v2, another_VAP_set ]

    function get_unique_id (item: StateValueAndPredictionsSet)
    {
        return `${item.id} ${item.version}`
    }

    factory_handle_change({
        all_VAP_sets,
        item: { latest: v2, older: [v1] },
        update_items: updated_items =>
        {
            const got = updated_items.map(get_unique_id)
            const expected = [get_unique_id(v2), get_unique_id(another_VAP_set)]
            test(got, expected)
        }
    })({ latest: v2, older: [] })
}

// run_tests()
