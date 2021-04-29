import { FunctionalComponent, h } from "preact"

import "./ValueAndPredictionSets.css"
import type {
    StateValueAndPredictionsSet,
    VersionedStateVAPsSet,
    WComponentStateV2SubType,
} from "../../shared/models/interfaces/state"
import { get_summary_for_single_vap_set, get_details_for_single_vap_set } from "./common"
import { ValueAndPredictionSetOlderVersions } from "./ValueAndPredictionSetOlderVersions"
import { prepare_new_versioned_vap_set } from "./utils"
import { useCallback, useMemo } from "preact/hooks"
import type { EditableListEntryTopProps } from "../../form/editable_list/EditableListEntry"
import type { ListContentProps } from "../../form/editable_list/ExpandableList"
import { factory_render_list_content } from "../../form/editable_list/render_list_content"
import { get_created_at_ms, partition_and_prune_items_by_datetimes } from "../../shared/models/utils_datetime"
import type { RootState } from "../../state/State"
import { connect, ConnectedProps } from "react-redux"
import { CustomisableEditableList } from "../../form/editable_list/CustomisableEditableList"
import { ungroup_vap_sets_by_version, group_vap_sets_by_version, sort_grouped_vap_sets } from "../../shared/models/value_and_prediction/utils"
import { Tense } from "../../shared/models/interfaces/datetime"
import { sort_list } from "../../shared/utils/sort"



interface OwnProps
{
    subtype: WComponentStateV2SubType
    values_and_prediction_sets: StateValueAndPredictionsSet[]
    update_values_and_predictions: (values_and_predictions: StateValueAndPredictionsSet[]) => void
}


const map_state = (state: RootState) => ({
    created_at_ms: state.routing.args.created_at_ms,
    sim_ms: state.routing.args.sim_ms,
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _ValueAndPredictionSets (props: Props)
{
    const { values_and_prediction_sets } = props
    const { invalid_items, past_items, present_items, future_items } = partition_and_prune_items_by_datetimes({
        items: values_and_prediction_sets,
        created_at_ms: props.created_at_ms,
        sim_ms: props.sim_ms,
    })
    const sorted_grouped_future_versioned_vap_sets = validate_sort_and_group_vap_sets_by_version(future_items, props.subtype)
    const sorted_grouped_present_versioned_vap_sets = validate_sort_and_group_vap_sets_by_version(present_items, props.subtype)
    const sorted_grouped_past_versioned_vap_sets = validate_sort_and_group_vap_sets_by_version(past_items, props.subtype)
    const all_items: VersionedStateVAPsSet[] = useMemo(() =>
    {
        return values_and_prediction_sets.map(latest => ({ latest, older: [] }))
    }, [values_and_prediction_sets])


    const item_top_props_future = useMemo(() => get_list_entry_top_props(props.subtype, Tense.future), [props.subtype])
    const item_top_props_present = useMemo(() => get_list_entry_top_props(props.subtype, Tense.present), [props.subtype])
    const item_top_props_past = useMemo(() => get_list_entry_top_props(props.subtype, Tense.past), [props.subtype])


    const factory_update_items = (other_items: StateValueAndPredictionsSet[]) => (versioned_vap_set: VersionedStateVAPsSet[]) =>
    {
        const ungrouped = ungroup_vap_sets_by_version(versioned_vap_set)
        const all = [...other_items, ...ungrouped]
        const sorted = sort_list(all, get_created_at_ms, "ascending")
        props.update_values_and_predictions(sorted)
    }


    const item_descriptor = "Value"


    const content_renderer = (list_content_props: ListContentProps) =>
    {
        const render_future_list_content = factory_render_list_content({
            items: sorted_grouped_future_versioned_vap_sets,
            get_id: get_latest_id,
            update_items: factory_update_items([...invalid_items, ...past_items, ...present_items]),
            item_top_props: item_top_props_future,
            item_descriptor,
        })

        const render_present_list_content = factory_render_list_content({
            items: sorted_grouped_present_versioned_vap_sets,
            get_id: get_latest_id,
            update_items: factory_update_items([...invalid_items, ...past_items, ...future_items]),
            item_top_props: item_top_props_present,
            item_descriptor,
        })

        const render_past_list_content = factory_render_list_content({
            items: sorted_grouped_past_versioned_vap_sets,
            get_id: get_latest_id,
            update_items: factory_update_items([...invalid_items, ...present_items, ...future_items]),
            item_top_props: item_top_props_past,
            item_descriptor,
        })

        return <div>
            {invalid_items.length ? <div>
                Hidden ({invalid_items.length})
            </div> : null}
            Future ({sorted_grouped_future_versioned_vap_sets.length}):
            {render_future_list_content(list_content_props)}
            <hr />
            Present ({sorted_grouped_present_versioned_vap_sets.length}):
            {render_present_list_content(list_content_props)}
            <hr />
            Past ({sorted_grouped_past_versioned_vap_sets.length}):
            {render_past_list_content(list_content_props)}
        </div>
    }


    return <CustomisableEditableList
        items={all_items}
        item_descriptor={item_descriptor}
        content_renderer={content_renderer}
        item_top_props={item_top_props_past}
        prepare_new_item={prepare_new_versioned_vap_set}
        update_items={factory_update_items(values_and_prediction_sets)}
        disable_collapsed={true}
    />
}

export const ValueAndPredictionSets = connector(_ValueAndPredictionSets) as FunctionalComponent<OwnProps>



function get_list_entry_top_props (subtype: WComponentStateV2SubType, tense: Tense): EditableListEntryTopProps<VersionedStateVAPsSet> {
    return {
        get_created_at: get_latest_created_at,
        get_custom_created_at: get_latest_custom_created_at,
        set_custom_created_at: set_latest_custom_created_at,
        get_summary: get_summary(subtype),
        get_details: get_details(subtype),
        get_details2: get_details2(subtype),
        extra_class_names: `value_and_prediction_sets ${tense === Tense.future ? "future" : (tense === Tense.present ? "present" : "past")}`,
    }
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



function validate_sort_and_group_vap_sets_by_version(values_and_prediction_sets: StateValueAndPredictionsSet[], subtype: WComponentStateV2SubType)
{
    const vap_sets = validate_vap_sets_for_subtype(values_and_prediction_sets, subtype)
    const grouped_vap_sets = group_vap_sets_by_version(vap_sets)
    const sorted_grouped_vap_sets = sort_grouped_vap_sets(grouped_vap_sets)

    return sorted_grouped_vap_sets
}
