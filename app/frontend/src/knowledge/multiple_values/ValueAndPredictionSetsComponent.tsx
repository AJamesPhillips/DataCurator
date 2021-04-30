import { h } from "preact"
import { useState } from "preact/hooks"

import { EditableListEntryTopProps, EditableListEntry } from "../../form/editable_list/EditableListEntry"
import { get_items_descriptor, ExpandableList } from "../../form/editable_list/ExpandableList"
import type { ExpandableListContentProps } from "../../form/editable_list/interfaces"
import { ListHeader } from "../../form/editable_list/ListHeader"
import { ListHeaderAddButton } from "../../form/editable_list/ListHeaderAddButton"
import { NewItemForm } from "../../form/editable_list/NewItemForm"
import { Tense } from "../../shared/models/interfaces/datetime"
import type { StateValueAndPredictionsSet, WComponentStateV2SubType, VersionedStateVAPsSet } from "../../shared/models/interfaces/state"
import { group_vap_sets_by_version, sort_grouped_vap_sets, ungroup_vap_sets_by_version } from "../../shared/models/value_and_prediction/utils"
import { upsert_entry, remove_from_list_by_predicate } from "../../utils/list"
import { get_summary_for_single_vap_set, get_details_for_single_vap_set } from "./common"
import { prepare_new_vap_set } from "./utils"
import { ValueAndPredictionSetOlderVersions } from "./ValueAndPredictionSetOlderVersions"



interface OwnProps
{
    item_descriptor: string
    values_and_prediction_sets: StateValueAndPredictionsSet[]
    subtype: WComponentStateV2SubType
    update_items: (items: StateValueAndPredictionsSet[]) => void

    invalid_items: StateValueAndPredictionsSet[]
    past_items: StateValueAndPredictionsSet[]
    present_items: StateValueAndPredictionsSet[]
    future_items: StateValueAndPredictionsSet[]
}


export function ValueAndPredictionSetsComponent (props: OwnProps)
{
    const [new_item, set_new_item] = useState<StateValueAndPredictionsSet | undefined>(undefined)

    const {
        item_descriptor, values_and_prediction_sets, subtype,
        invalid_items, future_items, present_items, past_items,
    } = props


    const vap_set_item_top_props: EditableListEntryTopProps<StateValueAndPredictionsSet> = {
        get_created_at: v => v.created_at,
        get_custom_created_at: v => v.custom_created_at,
        get_summary: get_summary_for_single_vap_set(subtype, false),
        get_details: get_details_for_single_vap_set(subtype),
        extra_class_names: `value_and_prediction_set new`
    }


    const sorted_grouped_future_versioned_vap_sets = validate_sort_and_group_vap_sets_by_version(future_items, subtype)
    const sorted_grouped_present_versioned_vap_sets = validate_sort_and_group_vap_sets_by_version(present_items, subtype)
    const sorted_grouped_past_versioned_vap_sets = validate_sort_and_group_vap_sets_by_version(past_items, subtype)


    const render_future_list_content = factory_render_list_content2({
        all_vap_sets: values_and_prediction_sets,
        grouped_versioned_vap_sets: sorted_grouped_future_versioned_vap_sets,
        update_items: props.update_items,
        subtype,
        tense: Tense.future,
    })

    const render_present_list_content = factory_render_list_content2({
        all_vap_sets: values_and_prediction_sets,
        grouped_versioned_vap_sets: sorted_grouped_present_versioned_vap_sets,
        update_items: props.update_items,
        subtype,
        tense: Tense.present,
    })

    const render_past_list_content = factory_render_list_content2({
        all_vap_sets: values_and_prediction_sets,
        grouped_versioned_vap_sets: sorted_grouped_past_versioned_vap_sets,
        update_items: props.update_items,
        subtype,
        tense: Tense.past,
    })


    return <div className="value_and_prediction_sets">
        <ListHeader
            items_descriptor={get_items_descriptor(item_descriptor, values_and_prediction_sets.length)}
            on_click_header={undefined}
            other_content={() => <ListHeaderAddButton
                new_item_descriptor={item_descriptor}
                on_pointer_down_new_list_entry={() => set_new_item(prepare_new_vap_set())}
            />}
        />

        <NewItemForm
            new_item={new_item}
            set_new_item={set_new_item}
            item_top_props={vap_set_item_top_props}
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
            items_descriptor={count_and_versions("Future", sorted_grouped_future_versioned_vap_sets, future_items)}
            disable_collapsed={true}
        />

        <hr />

        <ExpandableList
            content={render_present_list_content}
            item_descriptor=""
            items_descriptor={count_and_versions("Present", sorted_grouped_present_versioned_vap_sets, present_items)}
            disable_collapsed={true}
        />

        <hr />

        <ExpandableList
            content={render_past_list_content}
            item_descriptor=""
            items_descriptor={count_and_versions("Past", sorted_grouped_past_versioned_vap_sets, past_items)}
            disable_collapsed={true}
        />
    </div>
}



function validate_sort_and_group_vap_sets_by_version(values_and_prediction_sets: StateValueAndPredictionsSet[], subtype: WComponentStateV2SubType)
{
    const vap_sets = validate_vap_sets_for_subtype(values_and_prediction_sets, subtype)
    const grouped_vap_sets = group_vap_sets_by_version(vap_sets)
    const sorted_grouped_vap_sets = sort_grouped_vap_sets(grouped_vap_sets)

    return sorted_grouped_vap_sets
}



function validate_vap_sets_for_subtype (vap_sets: StateValueAndPredictionsSet[], subtype: WComponentStateV2SubType): StateValueAndPredictionsSet[]
{
    if (subtype === "boolean")
    {
        vap_sets.map(vap_set =>
        {
            const count = vap_set.entries.length
            if (count !== 1)
            {
                console.warn(`vap_set.id "${vap_set.id}" - Expected one value for vap_set.entries but got "${count}"`)
            }
        })
    }

    return vap_sets
}



function count_and_versions (title: string, grouped_items: {}[], all_versions: {}[])
{
    if (grouped_items.length === all_versions.length) return `${title} (${grouped_items.length})`

    return `${title} (${grouped_items.length} (${all_versions.length}))`
}



interface FactoryRenderListContentArgs <U, V>
{
    grouped_versioned_vap_sets: V[]
    all_vap_sets: U[]
    update_items: (items: U[]) => void
    subtype: WComponentStateV2SubType
    tense: Tense
}
function factory_render_list_content2 (args: FactoryRenderListContentArgs<StateValueAndPredictionsSet, VersionedStateVAPsSet>)
{
    const { grouped_versioned_vap_sets, all_vap_sets, update_items, subtype, tense } = args

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
            {grouped_versioned_vap_sets.map(item => <div key={get_latest_id(item)}>
                <hr className="entries_horizontal_dividers" />
                <EditableListEntry
                    item={item}

                    get_created_at={get_latest_created_at}
                    get_custom_created_at={get_latest_custom_created_at}
                    set_custom_created_at={set_latest_custom_created_at}
                    get_summary={get_summary(subtype)}
                    get_details={get_details(subtype)}
                    get_details2={get_details2(subtype)}
                    extra_class_names={`value_and_prediction_set ${tense === Tense.future ? "future" : (tense === Tense.present ? "present" : "past")}`}

                    expanded={expanded_item_rows}
                    disable_collapsable={disable_partial_collapsed}
                    on_change={modified_item =>
                    {
                        let updated_all_vap_sets = all_vap_sets
                        ungroup_vap_sets_by_version([modified_item]).forEach(modified_vap_set =>
                        {
                            updated_all_vap_sets = upsert_entry(updated_all_vap_sets, modified_vap_set, predicate_by_id(modified_vap_set), "")
                        })
                        update_items(updated_all_vap_sets)
                    }}
                    delete_item={() =>
                    {
                        update_items(remove_from_list_by_predicate(all_vap_sets, predicate_by_id(item.latest)))
                    }}
                />
            </div>)}
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


const get_summary = (subtype: WComponentStateV2SubType) => (versioned_vap_set: VersionedStateVAPsSet, on_change: (item: VersionedStateVAPsSet) => void): h.JSX.Element =>
{
    const { latest: latest_vap_set, older } = versioned_vap_set

    return get_summary_for_single_vap_set(subtype, false)(latest_vap_set, latest => on_change({ latest, older }))
}



const get_details = (subtype: WComponentStateV2SubType) => (versioned_vap_set: VersionedStateVAPsSet, on_change: (item: VersionedStateVAPsSet) => void): h.JSX.Element =>
{
    const { latest: latest_vap_set, older } = versioned_vap_set

    return get_details_for_single_vap_set(subtype)(latest_vap_set, latest => on_change({ latest, older }))
}


const get_details2 = (subtype: WComponentStateV2SubType) => (versioned_vap_set: VersionedStateVAPsSet, on_change: (item: VersionedStateVAPsSet) => void): h.JSX.Element =>
{
    return <div className="vap_set_details">
        <br />

        <ValueAndPredictionSetOlderVersions
            subtype={subtype}
            versioned_vap_set={versioned_vap_set}
            update_versioned_vap_set={on_change}
        />
        <br />

        <br />
    </div>
}
