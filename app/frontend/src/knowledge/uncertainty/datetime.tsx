import { h } from "preact"

import "./datetime.css"
import { EditableCustomDateTime } from "../../form/EditableCustomDateTime"
import type { TemporalUncertainty } from "../../shared/wcomponent/interfaces/uncertainty/uncertainty"


interface OwnProps
{
    datetime: TemporalUncertainty
    on_change: (item: TemporalUncertainty) => void
}


export function UncertainDateTime (props: OwnProps)
{
    const { datetime, on_change } = props

    return <div className="datetimes">
        <div className="datetime_section">
            <div className="datetime_title">min:</div>
            <div className="datetime_value"><EditableCustomDateTime
                value={datetime.min}
                on_change={min => on_change({ ...datetime, min })}
            /></div>
        </div>
        <div className="datetime_section">
            <div className="datetime_title">DateTime:</div>
            <div className="datetime_value"><EditableCustomDateTime
                value={datetime.value}
                on_change={value => on_change({ ...datetime, value })}
            /></div>
        </div>
        <div className="datetime_section">
            <div className="datetime_title">max:</div>
            <div className="datetime_value"><EditableCustomDateTime
                value={datetime.max}
                on_change={max => on_change({ ...datetime, max })}
            /></div>
        </div>
    </div>
}
