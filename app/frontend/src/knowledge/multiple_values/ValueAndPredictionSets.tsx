import { h } from "preact"

import "./ValueAndPredictionSets.css"
import type {
    StateValueAndPredictionsSet,
    VersionedStateVAPsSet,
    WComponentStateV2SubType,
} from "../../shared/models/interfaces/state"
import { get_new_value_id } from "../../utils/utils"
import { EditableList } from "../../form/editable_list/EditableList"
import { group_vap_sets_by_version, ungroup_vap_sets_by_version } from "../../shared/models/get_wcomponent_state_value"
import { get_summary_for_single_vap_set, get_details_for_single_vap_set } from "./common"
import { ValueAndPredictionSetOlderVersions } from "./ValueAndPredictionSetOlderVersions"



interface OwnProps
{
    subtype: WComponentStateV2SubType
    values_and_prediction_sets: StateValueAndPredictionsSet[]
    update_values_and_predictions: (values_and_predictions: StateValueAndPredictionsSet[]) => void
}



export function ValueAndPredictionSets (props: OwnProps)
{
    const vap_sets = validate_vap_sets_for_subtype(props.values_and_prediction_sets, props.subtype)
    const grouped_vap_sets = group_vap_sets_by_version(vap_sets)

    return <EditableList
        items={grouped_vap_sets}
        item_descriptor="Value"
        get_id={get_latest_id}
        get_created_at={get_latest_created_at}
        get_custom_created_at={get_latest_custom_created_at}
        set_custom_created_at={set_latest_custom_created_at}
        get_summary={get_summary(props.subtype)}
        get_details={get_details(props.subtype)}
        get_details2={get_details2(props.subtype)}
        prepare_new_item={prepare_new_item}
        update_items={versioned_vap_set =>
        {
            const ungrouped = ungroup_vap_sets_by_version(versioned_vap_set)
            props.update_values_and_predictions(ungrouped)
        }}
        entries_extra_class_names="value_and_prediction_sets"
        disable_collapsed={true}
    />
}

const get_latest_id = (item: VersionedStateVAPsSet) => item.latest.id
const get_latest_created_at = (item: VersionedStateVAPsSet) => item.latest.created_at
const get_latest_custom_created_at = (item: VersionedStateVAPsSet) => item.latest.custom_created_at
const set_latest_custom_created_at = (item: VersionedStateVAPsSet, custom_created_at: Date | undefined) =>
{
    return { ...item, latest: { ...item.latest, custom_created_at } }
}



const get_summary = (subtype: WComponentStateV2SubType) => (versioned_vap_set: VersionedStateVAPsSet, on_change: (item: VersionedStateVAPsSet) => void): h.JSX.Element =>
{
    const { latest: latest_vap_set, older } = versioned_vap_set

    return get_summary_for_single_vap_set(subtype, true)(latest_vap_set, latest => on_change({ latest, older }))
}



const get_details = (subtype: WComponentStateV2SubType) => (versioned_vap_set: VersionedStateVAPsSet, on_change: (item: VersionedStateVAPsSet) => void): h.JSX.Element =>
{
    const { latest: latest_vap_set, older } = versioned_vap_set

    return get_details_for_single_vap_set(subtype)(latest_vap_set, latest => on_change({ latest, older }))
}


const get_details2 = (subtype: WComponentStateV2SubType) => (versioned_vap_set: VersionedStateVAPsSet, on_change: (item: VersionedStateVAPsSet) => void, editing_new_item: boolean): h.JSX.Element =>
{

    if (editing_new_item) return <div />

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



function prepare_new_item (): VersionedStateVAPsSet
{
    return {
        latest: prepare_new_vap_set_item(),
        older: [],
    }
}


function prepare_new_vap_set_item (): StateValueAndPredictionsSet
{
    const now = new Date()

    return {
        id: get_new_value_id(),
        created_at: now,
        datetime: { value: now },
        entries: [],
    }
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
