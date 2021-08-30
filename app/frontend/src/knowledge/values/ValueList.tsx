import { h } from "preact"
import { useMemo } from "preact/hooks"

import type { StateValueString } from "../../shared/wcomponent/interfaces/state"
import { get_new_value_id } from "../../shared/utils/ids"
import { EditableList } from "../../form/editable_list/EditableList"
import { EditableText } from "../../form/editable_text/EditableText"
import { EditableTextSingleLine } from "../../form/editable_text/EditableTextSingleLine"
import type { EditableListEntryTopProps } from "../../form/editable_list/EditableListEntry"
import { get_new_created_ats } from "../../shared/utils/datetime"
import type { CreationContextState } from "../../shared/creation_context/state"
import { Box, FormControl, FormHelperText, TextField } from "@material-ui/core"



interface OwnProps {
    values: StateValueString[]
    update_values: (values: StateValueString[]) => void
    creation_context: CreationContextState
}



export function ValueList (props: OwnProps)
{
    const item_top_props = useMemo(() => {
        const props2: EditableListEntryTopProps<StateValueString> = {
            get_created_at,
            get_custom_created_at,
            get_summary,
            get_details,
        }

        return props2
    }, [])

    return <EditableList
        items={props.values}
        item_descriptor="Value"
        get_id={get_id}
        item_top_props={item_top_props}
        prepare_new_item={prepare_new_item(props.creation_context)}
        update_items={items => props.update_values(items)}
        disable_collapsed={true}
    />
}


const get_id = (item: StateValueString) => item.id
const get_created_at = (item: StateValueString) => item.created_at
const get_custom_created_at = (item: StateValueString) => item.custom_created_at


const prepare_new_item = (creation_context: CreationContextState) => (): StateValueString =>
{
    const created_ats = get_new_created_ats(creation_context)

    return {
        id: get_new_value_id(),
        ...created_ats,
        value: "",
        start_datetime: created_ats.custom_created_at || created_ats.created_at,
        description: "",
    }
}


function get_summary (item: StateValueString, on_change?: (item: StateValueString) => void): h.JSX.Element
{
    return  <FormControl>
        <TextField
            size="small"
            label="Value"
            variant="outlined"
            conditional_on_change={(new_value:any) => {
                const value = new_value && new_value.trim()
                if (on_change) on_change({ ...item, value })
            }}
        />
    </FormControl>
}


function get_details (item: StateValueString, on_change?: (item: StateValueString) => void): h.JSX.Element
{
    return <FormControl>
        <TextField
            size="small"
            label="Description"
            variant="outlined"
            conditional_on_change={on_change && ((new_d:any) => on_change({ ...item, description: new_d }))}
        />
    </FormControl>
}
