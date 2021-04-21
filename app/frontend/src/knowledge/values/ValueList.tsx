import { h } from "preact"

import type { StateValueString } from "../../shared/models/interfaces/state"
import { get_new_value_id } from "../../utils/utils"
import { EditableList } from "../../form/editable_list/EditableList"
import { EditableText } from "../../form/EditableText"
import { EditableTextSingleLine } from "../../form/EditableTextSingleLine"



interface OwnProps {
    values: StateValueString[]
    update_values: (values: StateValueString[]) => void
}



export function ValueList (props: OwnProps)
{
    return <EditableList
        items={props.values}
        item_descriptor="Value"
        get_id={get_id}
        get_created_at={get_created_at}
        get_custom_created_at={get_custom_created_at}
        get_summary={get_summary}
        get_details={get_details}
        prepare_new_item={prepare_new_item}
        update_items={items => props.update_values(items)}
    />
}


const get_id = (item: StateValueString) => item.id
const get_created_at = (item: StateValueString) => item.created_at
const get_custom_created_at = (item: StateValueString) => item.custom_created_at


function prepare_new_item (): StateValueString
{
    const now = new Date()

    return {
        id: get_new_value_id(),
        created_at: now,
        value: "",
        start_datetime: now,
        description: "",
    }
}


function get_summary (item: StateValueString, on_change?: (item: StateValueString) => void): h.JSX.Element
{
    return <div style={{ display: "inline-flex"}}>
        Value: &nbsp; <EditableTextSingleLine
            placeholder="value..."
            value={item.value || ""}
            on_change={new_value =>
            {
                const value = (new_value && new_value.trim()) || null
                if (on_change) on_change({ ...item, value })
            }}
        />
    </div>
}


function get_details (item: StateValueString, on_change?: (item: StateValueString) => void): h.JSX.Element
{
    return <div>
        <br />
        <div>
            Description: <EditableText
                placeholder="Description..."
                value={item.description}
                on_change={on_change && (new_d => on_change({ ...item, description: new_d }))}
            />
        </div>
    </div>
}
