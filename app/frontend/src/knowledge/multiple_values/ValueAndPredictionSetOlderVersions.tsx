import { h } from "preact"

import "./ValueAndPredictionSets.css"
import type {
    StateValueAndPredictionsSet,
    VersionedStateVAPsSet,
    WComponentStateV2SubType,
} from "../../shared/models/interfaces/state"
import {
    create_new_VAP_set_version,
} from "./utils"
import { ExpandableListWithAddButton } from "../../form/editable_list/ExpandableListWithAddButton"
import { get_summary_for_single_VAP_set, get_details_for_single_VAP_set, get_details2_for_single_VAP_set } from "./common"
import { factory_render_list_content } from "../../form/editable_list/render_list_content"



interface OwnProps
{
    subtype: WComponentStateV2SubType
    versioned_VAP_set: VersionedStateVAPsSet
    update_versioned_VAP_set: (versioned_VAP_set: VersionedStateVAPsSet) => void
}



export function ValueAndPredictionSetOlderVersions (props: OwnProps)
{
    const make_new_version = () =>
    {
        const new_versioned_VAP_set = create_new_VAP_set_version(props.versioned_VAP_set)
        props.update_versioned_VAP_set(new_versioned_VAP_set)
    }

    const items = props.versioned_VAP_set.older
    const item_descriptor = "Older version"

    return <ExpandableListWithAddButton
        items_count={items.length}
        item_descriptor={item_descriptor}
        new_item_descriptor="Version"
        content={factory_render_list_content(
        {
            items,
            get_id,
            update_items: older =>
            {
                props.update_versioned_VAP_set({ ...props.versioned_VAP_set, older })
            },
            debug_item_descriptor: item_descriptor,

            item_top_props: {
                get_created_at,
                get_custom_created_at,
                get_summary: get_summary_for_single_VAP_set(props.subtype, true, undefined),
                get_details: get_details_for_single_VAP_set(props.subtype),
                get_details2: get_details2_for_single_VAP_set,
                extra_class_names: "value_and_prediction_set",
            },
        })}
        on_click_new_item={make_new_version}
    />
}

const get_id = (item: StateValueAndPredictionsSet) => item.id
const get_created_at = (item: StateValueAndPredictionsSet) => item.created_at
const get_custom_created_at = (item: StateValueAndPredictionsSet) => item.custom_created_at
