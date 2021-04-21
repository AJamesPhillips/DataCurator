import { h } from "preact"

import type { Prediction } from "../../shared/models/interfaces/uncertainty"
import { get_new_prediction_id } from "../../utils/utils"
import { EditableList } from "../../form/editable_list/EditableList"
import { PredictionViewDetails, PredictionViewSummary } from "./PredictionView"



interface OwnProps {
    item_descriptor: string
    predictions: Prediction[]
    update_predictions: (predictions: Prediction[]) => void
}



export function PredictionList (props: OwnProps)
{
    return <EditableList
        items={props.predictions}
        item_descriptor={`${props.item_descriptor} Prediction`}
        get_id={get_id}
        get_created_at={get_created_at}
        get_custom_created_at={get_custom_created_at}
        get_summary={get_summary}
        get_details={get_details}
        prepare_new_item={prepare_new_item}
        update_items={items => props.update_predictions(items)}
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

    return {
        id: get_new_prediction_id(),
        created_at: now,
        datetime: { value: now },
        explanation: "",
        probability: 0,
        conviction: 0,
    }
}
