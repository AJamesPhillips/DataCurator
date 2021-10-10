import { h } from "preact"

import type { DerivedValueForUI } from "../interfaces"
import "./DisplayValue.css"



interface OwnProps
{
    UI_value: DerivedValueForUI
}

export function DisplayValue (props: OwnProps)
{
    const { UI_value: { values_string, assumed, uncertain } } = props

    const class_name = `value ${assumed ? "assumption" : ""} ${uncertain ? "uncertain" : ""}`

    return <span className={class_name}>{values_string}</span>
}
