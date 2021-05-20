import { h, FunctionalComponent } from "preact"
import { useMemo, useState } from "preact/hooks"

import type { Prediction } from "../../shared/wcomponent/interfaces/uncertainty"
import { get_new_prediction_id } from "../../shared/utils/ids"
import { PredictionViewDetails, PredictionViewSummary } from "./PredictionView"
import type { EditableListEntryTopProps } from "../../form/editable_list/EditableListEntry"
import { partition_and_prune_items_by_datetimes } from "../../shared/wcomponent/utils_datetime"
import { connect, ConnectedProps } from "react-redux"
import type { RootState } from "../../state/State"
import { get_items_descriptor, ExpandableList } from "../../form/editable_list/ExpandableList"
import { ListHeader } from "../../form/editable_list/ListHeader"
import { ListHeaderAddButton } from "../../form/editable_list/ListHeaderAddButton"
import { NewItemForm } from "../../form/editable_list/NewItemForm"
import { factory_render_list_content } from "../../form/editable_list/render_list_content"
import { floor_datetime, get_created_ats } from "../../shared/utils/datetime"



interface OwnProps {
    item_descriptor: string
    predictions: Prediction[]
    update_predictions: (predictions: Prediction[]) => void
}


const map_state = (state: RootState) => ({
    created_at_ms: state.routing.args.created_at_ms,
    sim_ms: state.routing.args.sim_ms,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _PredictionList (props: Props)
{
    const [new_item, set_new_item] = useState<Prediction | undefined>(undefined)

    const item_top_props = useMemo(() => {
        const props2: EditableListEntryTopProps<Prediction> = {
            get_created_at,
            get_custom_created_at,
            get_summary,
            get_details,
        }

        return props2
    }, [])


    const { item_descriptor, predictions, created_at_ms, sim_ms } = props
    const {
        invalid_items, future_items, present_items, past_items,
    } = partition_and_prune_items_by_datetimes({ items: predictions, created_at_ms, sim_ms })


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


    return <div>
        <ListHeader
            items_descriptor={get_items_descriptor(item_descriptor, predictions.length)}
            on_click_header={undefined}
            other_content={() => <ListHeaderAddButton
                new_item_descriptor={item_descriptor}
                on_pointer_down_new_list_entry={() => set_new_item(prepare_new_item())}
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

        {invalid_items.length ? <div>
            Hidden ({invalid_items.length})
        </div> : null}

        {predictions.length > 0 && <div>
            <ExpandableList
                content={render_future_list_content}
                item_descriptor=""
                items_descriptor={`Future (${future_items.length})`}
                disable_collapsed={true}
            />

            <hr />

            <ExpandableList
                content={render_present_list_content}
                item_descriptor=""
                items_descriptor={`Present (${present_items.length})`}
                disable_collapsed={true}
            />

            <hr />

            <ExpandableList
                content={render_past_list_content}
                item_descriptor=""
                items_descriptor={`Past (${past_items.length})`}
                disable_collapsed={true}
            />
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


function get_summary (item: Prediction, on_change?: (item: Prediction) => void): h.JSX.Element
{
    return <PredictionViewSummary
        prediction={item}
        on_change={prediction => on_change && on_change(prediction) }
    />
}


function get_details (item: Prediction, on_change?: (item: Prediction) => void): h.JSX.Element
{
    return <PredictionViewDetails
        prediction={item}
        on_change={prediction => on_change && on_change(prediction) }
    />
}


function prepare_new_item (): Prediction
{
    const created_ats = get_created_ats()
    const custom_now = floor_datetime(created_ats.custom_created_at || created_ats.created_at, "day")

    return {
        id: get_new_prediction_id(),
        ...created_ats,
        datetime: { min: custom_now },
        explanation: "",
        probability: 1,
        conviction: 1,
    }
}
