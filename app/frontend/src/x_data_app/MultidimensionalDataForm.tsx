import { useState } from "preact/hooks"

import { AutocompleteText } from "../form/Autocomplete/AutocompleteText"
import type {
    WComponentMultidimensionalState,
    WComponentMultidimensionalStateData,
    WComponentStateV2SubType,
} from "../wcomponent/interfaces/state"
import { wcomponent_statev2_subtype_options } from "../wcomponent_form/type_options"
import { TableDisplayMultiDimensionalData } from "./TableDisplayMultiDimensionalData"



interface OwnProps
{
    add_multidimensional_state: (multidimensional_state: WComponentMultidimensionalState) => void
    add_multidimensional_state_data: (multidimensional_data: WComponentMultidimensionalStateData) => void
}


export function MultidimensionalDataForm (props: OwnProps)
{
    const [title, set_title] = useState("")
    const [date, set_date] = useState<undefined | Date>(undefined)
    const [data_type, set_data_type] = useState<WComponentStateV2SubType>("number")
    const [parsed_data, set_parsed_data] = useState<string[][]>([])


    return <div>
        Title <input
            type="text"
            value={title}
            style={{ width: 250 }}
            onChange={e => set_title(e.currentTarget.value)}
        />

        <br />

        <div style={{ display: "inline-flex" }}>
            Type &nbsp; <AutocompleteText
            editing_allowed={true}
            selected_option_id={data_type}
            options={wcomponent_statev2_subtype_options}
            allow_none={false}
            on_change={data_type => data_type && set_data_type(data_type)}
        />
        </div>
        <br />
        <br />

        <div style={{ display: "inline-flex" }}>
            Date (Optional) &nbsp; <input
                type="date"
                value={date?.toISOString()}
                onChange={e =>
                {
                    set_date(e.currentTarget.valueAsDate || undefined)
                }}
            />
        </div>
        <br />
        <br />

        Input <textarea
            value=""
            rows={1}
            onChange={e =>
            {
                const value = e.currentTarget.value
                set_parsed_data(value.split("\n").map(row => row.split("\t")))
            }}
        />

        <br />

        <input
            type="button"
            value="Add"
            onChange={e =>
            {
                const multidimensional_state: WComponentMultidimensionalState = {
                    id: Math.random().toString(),
                    base_id: -1,
                    type: "multidimensional_state",
                    title,
                    description: "",
                    created_at: new Date(),
                    // data: reshape(parsed_data, ),
                }
                const multidimensional_state_data: WComponentMultidimensionalStateData = {
                    id: multidimensional_state.id,
                    schema_version: 1,
                    author_id: "abc",

                    data_type,
                    schema_description: "",
                    schema: { dimensions: [] },
                    dimension_data: {},
                    data: [],
                }
                props.add_multidimensional_state(multidimensional_state)
                props.add_multidimensional_state_data(multidimensional_state_data)
            }}
        />

        <br />

        Parsed value:
        <TableDisplayMultiDimensionalData
            data={parsed_data}
        />
    </div>
}
