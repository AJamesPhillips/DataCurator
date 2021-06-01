import { FunctionalComponent, h } from "preact"

import "./datetime.css"
import { EditableCustomDateTime } from "../../form/EditableCustomDateTime"
import type { TemporalUncertainty } from "../../shared/uncertainty/uncertainty"
import type { RootState } from "../../state/State"
import { connect, ConnectedProps } from "react-redux"


interface OwnProps
{
    datetime: TemporalUncertainty
    on_change: (item: TemporalUncertainty) => void
}



const map_state = (state: RootState) => ({
    show_unused_fields: !state.display_options.consumption_formatting,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _UncertainDateTime (props: Props)
{
    const { datetime, on_change, show_unused_fields } = props

    return <div className="datetimes">

        {(show_unused_fields || datetime.min) && <div className="datetime_section">
            <div className="datetime_title description_label">min</div>
            <div className="datetime_value"><EditableCustomDateTime
                value={datetime.min}
                on_change={min => on_change({ ...datetime, min })}
            /></div>
        </div>}

        {(show_unused_fields || datetime.value) && <div className="datetime_section">
            <div className="datetime_title description_label">DateTime</div>
            <div className="datetime_value"><EditableCustomDateTime
                value={datetime.value}
                on_change={value => on_change({ ...datetime, value })}
            /></div>
        </div>}

        {(show_unused_fields || datetime.max) && <div className="datetime_section">
            <div className="datetime_title description_label">max</div>
            <div className="datetime_value"><EditableCustomDateTime
                value={datetime.max}
                on_change={max => on_change({ ...datetime, max })}
            /></div>
        </div>}
    </div>
}

export const UncertainDateTime = connector(_UncertainDateTime) as FunctionalComponent<OwnProps>
