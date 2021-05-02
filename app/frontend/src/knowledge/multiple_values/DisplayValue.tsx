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

    const modifier_class_names = (
        (modifier === "assumed" ? "assumption" : "")
        + (modifier === "uncertain" ? "uncertain" : "")
    )


    return <span className={`value ${type} ${modifier_class_names}`} >{value}</span>
}
