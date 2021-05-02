import { h } from "preact"

import "./DisplayValue.css"
import type { UIStateValue } from "../../shared/models/interfaces/state"



interface OwnProps
{
    UI_value: UIStateValue
}

export function DisplayValue (props: OwnProps)
{
    const { value, type, modifier } = props.UI_value

    const assumption = modifier === "assumed" ? "assumption" : ""

    return <span className={`value ${type} ${assumption}`} >{value}</span>
}
