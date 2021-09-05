import { h } from "preact"
import type { StateValueAndPredictionsSet as VAPSet } from "../../shared/wcomponent/interfaces/state"
import {
    get_summary_for_single_VAP_set,
    get_details_for_single_VAP_set,
    get_details2_for_single_VAP_set,
} from "./common"
import { factory_render_list_content } from "../../form/editable_list/render_list_content"
import type { VAPsType } from "../../shared/wcomponent/interfaces/generic_value"
import { ExpandableListWithAddButton } from "../../form/editable_list/ExpandableListWithAddButton"



interface OwnProps
{
    VAPs_represent: VAPsType
    older_VAP_sets: VAPSet[]
    update_item: (vap_set: VAPSet) => void
    delete_item: (vap_set: VAPSet) => void
    editing: boolean
}



export function ValueAndPredictionSetOlderVersions (props: OwnProps)
{
    const { VAPs_represent, older_VAP_sets, update_item, delete_item, editing } = props
    const item_descriptor = "Older version"

    return <ExpandableListWithAddButton
        items_count={older_VAP_sets.length}
        item_descriptor={item_descriptor}
        new_item_descriptor="Version"
        content={factory_render_list_content(
        {
            items: older_VAP_sets,
            get_id,
            update_item,
            delete_item,
            debug_item_descriptor: item_descriptor,

            item_top_props: {
                get_created_at,
                get_custom_created_at,
                get_summary: get_summary_for_single_VAP_set(VAPs_represent, true, undefined),
                get_details: get_details_for_single_VAP_set(VAPs_represent),
                get_details2: get_details2_for_single_VAP_set(VAPs_represent, editing),
                extra_class_names: "value_and_prediction_set",
            },
        })}
        on_click_new_item={() => {}}
    />
}

const get_id = (item: VAPSet) => item.id
const get_created_at = (item: VAPSet) => item.created_at
const get_custom_created_at = (item: VAPSet) => item.custom_created_at
