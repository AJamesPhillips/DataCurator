import { h } from "preact"
import { useMemo } from "preact/hooks"

import type { Prediction } from "../../shared/models/interfaces/uncertainty"
import { get_new_prediction_id } from "../../utils/utils"
import { EditableList } from "../../form/editable_list/EditableList"
import { PredictionViewDetails, PredictionViewSummary } from "./PredictionView"
import type { EditableListEntryTopProps } from "../../form/editable_list/EditableListEntry"
import { get_today_str } from "../../shared/utils/date_helpers"
import { sort_list } from "../../shared/utils/sort"



interface OwnProps {
    item_descriptor: string
    predictions: Prediction[]
    update_predictions: (predictions: Prediction[]) => void
}



export function PredictionList (props: OwnProps)
{
    const item_top_props = useMemo(() => {
        const props2: EditableListEntryTopProps<Prediction> = {
            get_created_at,
            get_custom_created_at,
            get_summary,
            get_details,
        }

        return props2
    }, [])

    const sorted_predictions = sort_list(props.predictions, p => (get_custom_created_at(p) || get_created_at(p)).getTime(), "descending")

    return <EditableList
        items={sorted_predictions}
        item_descriptor={`${props.item_descriptor} Prediction`}
        get_id={get_id}
        item_top_props={item_top_props}
        prepare_new_item={prepare_new_item}
        update_items={items => props.update_predictions(items)}
        disable_collapsed={true}
    />
}


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
    const now = new Date()
    const custom_now = new Date(get_today_str())

    return {
        id: get_new_prediction_id(),
        created_at: now,
        custom_created_at: custom_now,
        datetime: { min: custom_now },
        explanation: "",
        probability: 1,
        conviction: 1,
    }
}
