import { h } from "preact"

import "./ValueAndPredictionSets.css"
import type {
    StateValueAndPredictionsSet,
    VersionedStateVAPsSet,
    WComponentStateV2SubType,
} from "../../shared/models/interfaces/state"
import {
    create_new_vap_set_version,
} from "./utils"
import { List } from "../../form/editable_list/List"
import { get_summary_for_single_vap_set, get_details_for_single_vap_set } from "./common"



interface OwnProps
{
    subtype: WComponentStateV2SubType
    versioned_vap_set: VersionedStateVAPsSet
    update_versioned_vap_set: (versioned_vap_set: VersionedStateVAPsSet) => void
}



export function ValueAndPredictionSetOlderVersions (props: OwnProps)
{
    const make_new_version = () =>
    {
        const new_versioned_vap_set = create_new_vap_set_version(props.versioned_vap_set)
        props.update_versioned_vap_set(new_versioned_vap_set)
    }

    return <List
        items={props.versioned_vap_set.older}
        item_descriptor="Older version"
        new_item_descriptor="Version"
        get_id={get_id}
        get_created_at={get_created_at}
        get_custom_created_at={get_custom_created_at}
        get_summary={get_summary_for_single_vap_set(props.subtype, true)}
        get_details={get_details_for_single_vap_set(props.subtype)}
        on_click_new_item={make_new_version}
        update_items={older =>
        {
            props.update_versioned_vap_set({ ...props.versioned_vap_set, older })
        }}
        entries_extra_class_names="value_and_prediction_sets"
    />
}

const get_id = (item: StateValueAndPredictionsSet) => item.id
const get_created_at = (item: StateValueAndPredictionsSet) => item.created_at
const get_custom_created_at = (item: StateValueAndPredictionsSet) => item.custom_created_at
