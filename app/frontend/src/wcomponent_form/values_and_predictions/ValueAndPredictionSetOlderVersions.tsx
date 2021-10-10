import { h, FunctionalComponent } from "preact"
import { useMemo } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import type { StateValueAndPredictionsSet as VAPSet } from "../../wcomponent/interfaces/state"
import {
    get_summary_for_single_VAP_set,
    get_details_for_single_VAP_set,
    get_details2_for_single_VAP_set,
} from "./common"
import { factory_render_list_content } from "../../form/editable_list/render_list_content"
import type { VAPsType } from "../../wcomponent/interfaces/value_probabilities_etc"
import { ExpandableListWithAddButton } from "../../form/editable_list/ExpandableListWithAddButton"
import { create_new_VAP_set_version } from "../../wcomponent/CRUD_helpers/prepare_new_VAP_set"
import type { RootState } from "../../state/State"
import type { ListItemCRUDRequiredU } from "../../form/editable_list/EditableListEntry"
import type { ValuePossibilitiesById } from "../../wcomponent/interfaces/possibility"



interface OwnProps extends ListItemCRUDRequiredU<VAPSet>
{
    value_possibilities: ValuePossibilitiesById | undefined
    VAPs_represent: VAPsType
    current_VAP_set: VAPSet
    older_VAP_sets: VAPSet[]
    create_item: (item: VAPSet) => void
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
    const {
        editing,
        value_possibilities, VAPs_represent, older_VAP_sets,
        create_item, update_item, delete_item,
    } = props
    const item_descriptor = "Older version"

    const make_new_version = useMemo(() => () =>
    {
        const new_versioned_VAP_set = create_new_VAP_set_version(props.current_VAP_set, props.creation_context)
        create_item(new_versioned_VAP_set)
    }, [props.current_VAP_set, props.creation_context, create_item])


    const content = useMemo(() => factory_render_list_content(
    {
        items: older_VAP_sets,
        get_id,
        debug_item_descriptor: item_descriptor,

        item_props: {
            get_created_at,
            get_custom_created_at,
            get_summary: get_summary_for_single_VAP_set(VAPs_represent, true),
            get_details: get_details_for_single_VAP_set(value_possibilities, VAPs_represent),
            get_details2: get_details2_for_single_VAP_set(VAPs_represent, editing),
            extra_class_names: "value_and_prediction_set",
            crud: {
                create_item,
                update_item,
                delete_item,
            },
            delete_button_text: "Delete Older Set of Value & Predictions",
        },
    }), [older_VAP_sets, item_descriptor, VAPs_represent, editing, create_item, update_item, delete_item])

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
