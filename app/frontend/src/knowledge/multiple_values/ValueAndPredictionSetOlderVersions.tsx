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
import { ExpandableList } from "../../form/editable_list/ExpandableList"
import { get_summary_for_single_vap_set, get_details_for_single_vap_set } from "./common"
import { render_list_content } from "../../form/editable_list/render_list_content"



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

    const items = props.versioned_vap_set.older
    const item_descriptor = "Older version"

    return <ExpandableList
        items_count={items.length}
        item_descriptor={item_descriptor}
        new_item_descriptor="Version"
        content={render_list_content(
        {
            items,
            get_id,
            update_items: older =>
            {
                props.update_versioned_vap_set({ ...props.versioned_vap_set, older })
            },
            item_descriptor,

            item_top_props: {
                get_created_at,
                get_custom_created_at,
                get_summary: get_summary_for_single_vap_set(props.subtype, true),
                get_details: get_details_for_single_vap_set(props.subtype),
                extra_class_names: "value_and_prediction_sets",
            },
        })}
        on_click_new_item={make_new_version}
    />
}

const get_id = (item: StateValueAndPredictionsSet) => item.id
const get_created_at = (item: StateValueAndPredictionsSet) => item.created_at
const get_custom_created_at = (item: StateValueAndPredictionsSet) => item.custom_created_at
