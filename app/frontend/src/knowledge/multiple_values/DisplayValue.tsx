import { h } from "preact"

import "./DisplayValue.css"
import type { UIValue } from "../../shared/wcomponent/interfaces/generic_value"



interface OwnProps
{
    UI_value: UIValue
}

export function DisplayValue (props: OwnProps)
{
    const { UI_value: { values_string, assumed, uncertain } } = props

    const class_name = `value ${assumed ? "assumption" : ""} ${uncertain ? "uncertain" : ""}`

    return <span className={class_name}>{values_string}</span>
}
