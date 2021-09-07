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
import { create_new_VAP_set_version } from "./utils"
import type { CreationContextState } from "../../shared/creation_context/state"
import type { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"
import type { RootState } from "../../state/State"
import { useMemo } from "preact/hooks"



interface OwnProps
{
    VAPs_represent: VAPsType
    current_VAP_set: VAPSet
    older_VAP_sets: VAPSet[]
    create_item: (vap_set: VAPSet) => void
    update_item: (vap_set: VAPSet) => void
    delete_item: (vap_set: VAPSet) => void
}



const map_state = (state: RootState) =>
{
    return {
        creation_context: state.creation_context,
        editing: !state.display_options.consumption_formatting,
    }
}



const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _ValueAndPredictionSetOlderVersions (props: Props)
{
    const { VAPs_represent, older_VAP_sets, create_item, update_item, delete_item, editing } = props
    const item_descriptor = "Older version"

    const make_new_version = useMemo(() => () =>
    {
        const new_versioned_VAP_set = create_new_VAP_set_version(props.current_VAP_set, props.creation_context)
        props.create_item(new_versioned_VAP_set)
    }, [props.current_VAP_set, props.creation_context, props.create_item])


    const content = factory_render_list_content(
    {
        items: older_VAP_sets,
        get_id,
        create_item,
        update_item,
        delete_item,
        debug_item_descriptor: item_descriptor,

        item_top_props: {
            get_created_at,
            get_custom_created_at,
            get_summary: get_summary_for_single_VAP_set(VAPs_represent, true),
            get_details: get_details_for_single_VAP_set(VAPs_represent),
            get_details2: get_details2_for_single_VAP_set(VAPs_represent, editing),
            extra_class_names: "value_and_prediction_set",
        },
    })

    return <ExpandableListWithAddButton
        items_count={older_VAP_sets.length}
        item_descriptor={item_descriptor}
        new_item_descriptor="Version"
        content={content}
        on_click_new_item={make_new_version}
    />
}

export const ValueAndPredictionSetOlderVersions = connector(_ValueAndPredictionSetOlderVersions) as FunctionalComponent<OwnProps>


const get_id = (item: VAPSet) => item.id
const get_created_at = (item: VAPSet) => item.created_at
const get_custom_created_at = (item: VAPSet) => item.custom_created_at
