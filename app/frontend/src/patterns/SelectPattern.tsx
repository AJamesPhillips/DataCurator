import { h } from "preact"
import { ItemSelect } from "../search/ItemSelect"
import type { Item, Pattern } from "../state/State"


type OwnProps =
{
    pattern_id: string
} & (
    {
        disabled: true
    } | {
        disabled: false
        on_change_pattern: (item: Pattern) => void
    }
)


export function SelectPattern (props: OwnProps)
{
    return <div>
        {props.disabled && <ItemSelect
            editable={false}
            item_id={props.pattern_id}
            filter="patterns"
        />}
        {!props.disabled && <ItemSelect
            editable={true}
            item_id={props.pattern_id}
            filter="patterns"
            on_change_item={(item: Item) => props.on_change_pattern(item as Pattern)}
        />}
    </div>
}
