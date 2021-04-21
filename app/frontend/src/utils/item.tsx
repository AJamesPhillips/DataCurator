import { h } from "preact"

import { LabelsList } from "../labels/LabelsList"
import { ObjectDescription } from "../objects/ObjectDescription"
import type { Statement, Objekt, Pattern, Item } from "../state/State"


export function is_statement (s: Item): s is Statement
{
    return !is_object(s) && !is_item(s)
}


export function is_item (s: Item): s is Item
{
    return s.hasOwnProperty("name")
}


export function is_object (s: Item): s is Objekt
{
    return s.hasOwnProperty("pattern_id")
}


export function description_statement (statement: Statement)
{
    return <div>
        {statement.content}
        <div style={{ display: "inline-block"}}>
            <LabelsList labels={statement.labels} />
        </div>
    </div>
}


export function description_pattern (pattern: Pattern)
{
    return pattern.name
}


export function description (item: Item)
{
    if (is_object(item))
    {
        return <ObjectDescription object={item} />
    }

    if (is_statement(item)) {
        return description_statement(item)
    }

    return item.name
}
