import { h } from "preact"
import { useMemo } from "preact/hooks"
import { TextField } from "@material-ui/core"

import type { StateValueString } from "../../shared/wcomponent/interfaces/state"
import { get_new_value_id } from "../../shared/utils/ids"
import { EditableList } from "../../form/editable_list/EditableList"
import type {
    EditableListEntryItemProps,
    ListItemCRUD,
    ListItemCRUDRequiredC,
    ListItemCRUDRequiredCU,
} from "../../form/editable_list/EditableListEntry"
import { get_new_created_ats } from "../../shared/utils/datetime"



interface OwnProps {
    values: StateValueString[]
    // update_values: (values: StateValueString[]) => void
    // creation_context: CreationContextState
}



export function ValueList (props: OwnProps)
{
    const item_props = useMemo<EditableListEntryItemProps<StateValueString, ListItemCRUDRequiredCU<StateValueString>>>(() => ({
        get_created_at,
        get_custom_created_at,
        get_summary,
        get_details,
        crud: {
            // noop as we're deprecating Statev1 and it's ValueList
            update_item: () => {},
            // noop as we're deprecating Statev1 and it's ValueList
            create_item: () => {},
        },
    }), [])

    return <EditableList
        items={props.values}
        item_descriptor="Value"
        get_id={get_id}
        item_props={item_props}
        prepare_new_item={prepare_new_item}
        disable_collapsed={true}
    />
}


const get_id = (item: StateValueString) => item.id
const get_created_at = (item: StateValueString) => item.created_at
const get_custom_created_at = (item: StateValueString) => item.custom_created_at


const prepare_new_item = (): StateValueString =>
{
    const created_ats = get_new_created_ats()

    return {
        id: get_new_value_id(),
        ...created_ats,
        value: "",
        start_datetime: created_ats.custom_created_at || created_ats.created_at,
        description: "",
    }
}


function get_summary (item: StateValueString, crud: ListItemCRUD<StateValueString>): h.JSX.Element
{
    return <TextField
        size="small"
        label="Value"
        variant="outlined"
        value={item.value}
        // Disalllow editing for now as we're deprecating StateV1 and its values anyway #101
        // conditional_on_change={(new_value: any) => {
        //     const value = new_value && new_value.trim()
        //     crud.update_item({ ...item, value })
        // }}
    />
}


function get_details (item: StateValueString, crud: ListItemCRUD<StateValueString>): h.JSX.Element
{
    return <TextField
        size="small"
        label="Description"
        variant="outlined"
        value={item.description}
        // Disalllow editing for now as we're deprecating StateV1 and its values anyway #101
        // conditional_on_change={(description: string) => crud.update_item({ ...item, description }))}
    />
}
