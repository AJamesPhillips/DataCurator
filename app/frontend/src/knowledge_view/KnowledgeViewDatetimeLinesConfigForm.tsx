import { h } from "preact"

import type { KnowledgeView, KnowledgeViewsById } from "../shared/interfaces/knowledge_view"
import { EditableCustomDateTime } from "../form/EditableCustomDateTime"
import { EditableNumber } from "../form/EditableNumber"
import { DEFAULT_DATETIME_LINE_CONFIG } from "./datetime_line"
import {
    get_composed_datetime_lines_config,
    get_foundational_knowledge_views,
} from "../state/specialised_objects/knowledge_views/knowledge_views_derived_reducer"
import { Button } from "../sharedf/Button"
import type { DatetimeLineConfig } from "../shared/interfaces/datetime_lines"



interface OwnProps
{
    editing: boolean
    knowledge_view: KnowledgeView
    knowledge_views_by_id: KnowledgeViewsById
    update_item: (kv: KnowledgeView) => void
}

export const KnowledgeViewDatetimeLinesConfigForm = (props: OwnProps) =>
{
    const { editing, knowledge_view } = props

    const foundational_knowledge_view = get_foundational_knowledge_views(knowledge_view, props.knowledge_views_by_id, false)
    const composed = get_composed_datetime_lines_config(foundational_knowledge_view, false)

    const { datetime_line_config: orig_datetime_line_config = {} } = knowledge_view

    const final_time_origin_ms = orig_datetime_line_config.time_origin_ms ?? composed.time_origin_ms // There is no DEFAULT_DATETIME_LINE_CONFIG.time_origin_ms


    const update_item = (config: DatetimeLineConfig) =>
    {
        const new_datetime_line_config: DatetimeLineConfig = {
            ...orig_datetime_line_config,
            ...config,
        }
        props.update_item({ ...knowledge_view, datetime_line_config: new_datetime_line_config })
    }


    if (final_time_origin_ms === undefined)
    {
        if (!editing) return null
        return <div>
            <h4>Configure X Axis Datetime</h4>
            <p>
                <EditableCustomDateTime
                    title="Time origin"
                    value={undefined}
                    on_change={new_time_origin_date =>
                    {
                        const new_time_origin_ms = new_time_origin_date ? new_time_origin_date.getTime() : undefined
                        update_item({ time_origin_ms: new_time_origin_ms })
                    }}
                />
            </p>
        </div>
    }



    const final_time_origin_x = inherit_or_default(orig_datetime_line_config, composed, "time_origin_x")
    const final_time_scale = inherit_or_default(orig_datetime_line_config, composed, "time_scale")
    const final_time_line_number = inherit_or_default(orig_datetime_line_config, composed, "time_line_number")
    const final_time_line_spacing_days = inherit_or_default(orig_datetime_line_config, composed, "time_line_spacing_days")


    return <div>
        <h4>Configure X Axis Datetime</h4>
        <p>
            <EditableCustomDateTime
                title="Time origin"
                value={new Date(final_time_origin_ms)}
                on_change={new_time_origin_date =>
                {
                    const new_time_origin_ms = new_time_origin_date ? new_time_origin_date.getTime() : undefined
                    update_item({ time_origin_ms: new_time_origin_ms })
                }}
            />
        </p>

        <p>
            <EditableNumber
                placeholder="Time origin position"
                value={final_time_origin_x.value}
                allow_undefined={true}
                conditional_on_blur={new_time_origin_x =>
                {
                    update_item({ time_origin_x: new_time_origin_x })
                }}
                style={{ width: "70%" }}
            />
            {editing && <IndicateSource source={final_time_origin_x.source} />}
        </p>

        <p>
            <EditableNumber
                placeholder="Time scale"
                value={final_time_scale.value}
                allow_undefined={true}
                conditional_on_blur={new_time_scale =>
                {
                    update_item({ time_scale: new_time_scale })
                }}
                style={{ width: "70%" }}
            />
            {editing && <IndicateSource source={final_time_scale.source} />}
        </p>

        <p>
            <EditableNumber
                placeholder="Time line number"
                value={final_time_line_number.value}
                allow_undefined={true}
                conditional_on_blur={new_time_line_number =>
                {
                    update_item({ time_line_number: new_time_line_number })
                }}
                style={{ width: "70%" }}
            />
            {editing && <IndicateSource source={final_time_line_number.source} />}
        </p>

        <p>
            <EditableNumber
                placeholder="Days between time line"
                value={final_time_line_spacing_days.value}
                allow_undefined={true}
                conditional_on_blur={new_time_line_spacing_days =>
                {
                    update_item({ time_line_spacing_days: new_time_line_spacing_days })
                }}
                style={{ width: "70%" }}
            />
            {editing && <IndicateSource source={final_time_line_spacing_days.source} />}
        </p>

        {editing && <p>
            <Button
                value="Clear (to inherited or default to month)"
                fullWidth={true}
                onClick={() =>
                {
                    update_item({
                        time_scale: undefined,
                        time_line_number: undefined,
                        time_line_spacing_days: undefined,
                    })
                }}
            />
            <br />
            <br />
            <Button
                value="Set to Year"
                fullWidth={true}
                onClick={() =>
                {
                    update_item({
                        time_scale: 0.3,
                        time_line_number: 2,
                        time_line_spacing_days: 365,
                    })
                }}
            />
        </p>}

    </div>
}



enum ValueSource
{
    own,
    inherited,
    default
}
function inherit_or_default (current_config: DatetimeLineConfig, inheritable_composed: DatetimeLineConfig, key: keyof DatetimeLineConfig)
{
    const value = current_config[key] ?? inheritable_composed[key] ?? DEFAULT_DATETIME_LINE_CONFIG[key]
    const source: ValueSource = value === current_config[key]
        ? ValueSource.own
        : value === inheritable_composed[key] ? ValueSource.inherited : ValueSource.default

    return { value, source }
}



function IndicateSource (props: { source: ValueSource })
{
    if (props.source === ValueSource.own) return null

    const title = props.source === ValueSource.inherited ? "Inherited from foundation" : "Default"

    return <div style={{ color: "grey", fontSize: 11 }} title={title}>
        {props.source === ValueSource.inherited ? "(Inherited)" : "(Default)"}
    </div>
}
