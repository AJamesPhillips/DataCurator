import { h, FunctionalComponent } from "preact"
import { useMemo, useState } from "preact/hooks"

import type { Prediction } from "../../shared/uncertainty/uncertainty"
import { get_new_prediction_id } from "../../shared/utils/ids"
import { PredictionViewDetails, PredictionViewSummary } from "./PredictionView"
import type { EditableListEntryTopProps, ListItemCRUD } from "../../form/editable_list/EditableListEntry"
import { connect, ConnectedProps } from "react-redux"
import type { RootState } from "../../state/State"
import { get_items_descriptor, ExpandableList } from "../../form/editable_list/ExpandableList"
import { ListHeader } from "../../form/editable_list/ListHeader"
import { ListHeaderAddButton } from "../../form/editable_list/ListHeaderAddButton"
import { NewItemForm } from "../../form/editable_list/NewItemForm"
import { factory_render_list_content } from "../../form/editable_list/render_list_content"
import { floor_datetime_to_resolution, get_new_created_ats } from "../../shared/utils/datetime"
import type { CreationContextState } from "../../shared/creation_context/state"
import { partition_and_prune_items_by_datetimes_and_versions } from "../../shared/wcomponent/value_and_prediction/utils"



interface OwnProps {
    item_descriptor: string
    predictions: Prediction[]
    update_predictions: (predictions: Prediction[]) => void
}


const map_state = (state: RootState) => ({
    created_at_ms: state.routing.args.created_at_ms,
    sim_ms: state.routing.args.sim_ms,
    creation_context: state.creation_context,
    editing: !state.display_options.consumption_formatting,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _PredictionList (props: Props)
{
    const [new_item, set_new_item] = useState<Prediction | undefined>(undefined)
    const { item_descriptor, predictions, created_at_ms, sim_ms, editing } = props

    const item_top_props = useMemo(() => {
        const props2: EditableListEntryTopProps<Prediction> = {
            get_created_at,
            get_custom_created_at,
            get_summary,
            get_details: factory_get_details(editing),
        }

        return props2
    }, [editing])


    const {
        invalid_future_items, future_items, present_items, past_items,
    } = partition_and_prune_items_by_datetimes_and_versions({ items: predictions, created_at_ms, sim_ms })


    function everything_but (predictions_subset: Prediction[]): Prediction[]
    {
        const to_exclude = new Set<string>()
        predictions_subset.forEach(({ id }) => to_exclude.add(id))
        return predictions.filter(({ id }) => !to_exclude.has(id))
    }


    const render_future_list_content = factory_render_list_content({
        items: future_items,
        get_id,
        update_items: new_items => props.update_predictions([...new_items, ...everything_but(future_items)]),
        item_top_props,
    })

    const render_present_list_content = factory_render_list_content({
        items: present_items,
        get_id,
        update_items: new_items => props.update_predictions([...new_items, ...everything_but(present_items)]),
        item_top_props,
    })

    const render_past_list_content = factory_render_list_content({
        items: past_items,
        get_id,
        update_items: new_items => props.update_predictions([...new_items, ...everything_but(past_items)]),
        item_top_props,
    })


    const title = editing
        ? get_items_descriptor(item_descriptor, predictions.length, editing)
        : item_descriptor


    const show_futures = editing || future_items.length > 0
    const show_presents = editing || present_items.length > 0
    const show_pasts = editing || past_items.length > 0


    return <div>
        <ListHeader
            items_descriptor={title}
            on_click_header={undefined}
            other_content={() => <ListHeaderAddButton
                new_item_descriptor={item_descriptor}
                on_pointer_down_new_list_entry={() => set_new_item(prepare_new_item(props.creation_context))}
            />}
        />

        <NewItemForm
            new_item={new_item}
            set_new_item={set_new_item}
            item_top_props={item_top_props}
            item_descriptor={item_descriptor}
            add_item={new_item =>
            {
                props.update_predictions([...predictions, new_item])
                set_new_item(undefined)
            }}
        />

        {invalid_future_items.length > 0 && <div>
            Hidden ({invalid_future_items.length})
        </div>}

        {predictions.length > 0 && <div>
            {show_futures && <ExpandableList
                content={render_future_list_content}
                item_descriptor=""
                items_descriptor={get_items_descriptor("Future", future_items.length, editing)}
                disable_collapsed={true}
            />}

            {(show_futures || show_presents) && <hr />}

            {show_presents && <ExpandableList
                content={render_present_list_content}
                item_descriptor=""
                items_descriptor={get_items_descriptor("Present", present_items.length, editing)}
                disable_collapsed={true}
            />}

            {show_presents && show_pasts && <hr />}

            {show_pasts && <ExpandableList
                content={render_past_list_content}
                item_descriptor=""
                items_descriptor={get_items_descriptor("Past", past_items.length, editing)}
                disable_collapsed={true}
            />}
        </div>}
    </div>

    // <EditableList
    //     items={sorted_predictions}
    //     item_descriptor={`${props.item_descriptor} Prediction`}
    //     get_id={get_id}
    //     item_top_props={item_top_props}
    //     prepare_new_item={prepare_new_item}
    //     update_items={items => props.update_predictions(items)}
    //     disable_collapsed={true}
    // />
}

export const PredictionList = connector(_PredictionList) as FunctionalComponent<OwnProps>


const get_id = (item: Prediction) => item.id
const get_created_at = (item: Prediction) => item.created_at
const get_custom_created_at = (item: Prediction) => item.custom_created_at


function get_summary (item: Prediction, crud: ListItemCRUD<Prediction>): h.JSX.Element
{
    return <PredictionViewSummary
        prediction={item}
        on_change={crud.update_item}
    />
}


function factory_get_details (editing: boolean)
{
    return (item: Prediction, crud: ListItemCRUD<Prediction>): h.JSX.Element => <PredictionViewDetails
        prediction={item}
        on_change={crud.update_item}
        editing={editing}
    />
}


function prepare_new_item (creation_context: CreationContextState): Prediction
{
    const created_ats = get_new_created_ats(creation_context)
    const custom_now = floor_datetime_to_resolution(created_ats.custom_created_at || created_ats.created_at, "day")

    return {
        id: get_new_prediction_id(),
        ...created_ats,
        datetime: { min: custom_now },
        explanation: "",
        probability: 1,
        conviction: 1,
    }
}
