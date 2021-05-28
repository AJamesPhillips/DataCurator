import { h } from "preact"

import "./DisplayValue.css"
import type { UIStateValue } from "../../shared/wcomponent/interfaces/state"
import type { UIValue } from "../../shared/wcomponent/interfaces/generic_value"



interface OwnProps
{
    UI_value: UIStateValue | UIValue
}

export function DisplayValue (props: OwnProps)
{
    const { UI_value } = props

    const value = UI_value_to_string(UI_value.value)
    let class_name = "value"

    if (is_UI_state_value(UI_value))
    {
        const { type, modifier } = UI_value

        const modifier_class_names = (
            (modifier === "assumed" ? "assumption" : "")
            + (modifier === "uncertain" ? "uncertain" : "")
        )

        class_name += ` ${type} ${modifier_class_names}`
    }
    else
    {
        class_name += ` ${UI_value.assumed ? "assumption" : ""} ${UI_value.uncertain ? "uncertain" : ""}`
    }

    return <span className={class_name}>{value}</span>
}



function is_UI_state_value (value: UIStateValue | UIValue): value is UIStateValue
{
    return (value as UIStateValue).type !== undefined
}


function UI_value_to_string (value: string | undefined | null) // TODO remove `| null`
{
    if (value) return value
    return value === undefined ? "undefined" : "empty"
}
