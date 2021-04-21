import { h } from "preact"
import { SelectPattern } from "../../patterns/SelectPattern"

import type { Model } from "./interfaces"


interface ChangeModelProps extends Model
{
    on_change: (field: keyof Model) => (value: string) => void
    delete: () => void
}


export function ObjectBulkImportModel (props: ChangeModelProps)
{
    return <div>
        <input
            type="text"
            value={props.name}
            onChange={handle_event(props.on_change("name"))}
            placeholder="Name"
        />

        <input
            type="text"
            value={props.table_id}
            onChange={handle_event(props.on_change("table_id"))}
            placeholder="Table ID"
        />

        <input
            type="text"
            value={props.view_id}
            onChange={handle_event(props.on_change("view_id"))}
            placeholder="View ID"
        />

        <SelectPattern
            pattern_id={props.pattern_id}
            disabled={false}
            on_change_pattern={item => props.on_change("pattern_id")(item.id)}
        />

        <input type="button" value="X" onClick={props.delete} />

        <br /><br />

    </div>
}


const handle_event = (on_change: (value: string) => void) =>
    (e: h.JSX.TargetedEvent<HTMLInputElement, Event>) => on_change(e.currentTarget.value)
