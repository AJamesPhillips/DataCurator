import { FunctionalComponent } from "preact"

import type { DerivedValueForUI } from "../interfaces/value"
import "./DisplayValue.css"
import { Link } from "../../sharedf/Link"
import { ALTERNATIVE_VALUE_COLOR, AltRouteIcon } from "../../sharedf/icons/AltRouteIcon"
import { ConnectedProps, connect } from "react-redux"
import { RootState } from "../../state/State"
import { RichTextType, get_title } from "../../sharedf/rich_text/get_rich_text"
import { get_wc_id_to_counterfactuals_v2_map } from "../../state/derived/accessor"
import { Tooltip } from "@mui/material"
import { remove_rich_text } from "../../sharedf/rich_text/remove_rich_text"



interface OwnProps
{
    UI_value: DerivedValueForUI
}

export function DisplayValue (props: OwnProps)
{
    const { UI_value } = props
    const { values_string, counterfactual_applied, uncertain, derived__using_values_from_wcomponent_ids } = UI_value
    const assumption_or_other_forced_value = counterfactual_applied || !!(derived__using_values_from_wcomponent_ids?.length || 0)

    // TODO we need to re-work the colouring of this now because before the
    // counterfactuals that showed up as assumption and cause the value to show as orange
    // never had uncertainty, but now with state_value being included in this then it can be
    // uncertain as well as `assumption_or_other_forced_value` being true.
    const class_name = `value ${assumption_or_other_forced_value ? "assumption" : ""} ${uncertain ? "uncertain" : ""}`
    let tooltip_text = "Current value"
    if (assumption_or_other_forced_value) tooltip_text += " is an assumption"
    if (assumption_or_other_forced_value && uncertain) tooltip_text += " and"
    if (uncertain) tooltip_text += " has uncertainty"

    return <>
        <Tooltip className={class_name} title={tooltip_text} aria-label={tooltip_text}>
            <span>{values_string}</span>
        </Tooltip>
        {(derived__using_values_from_wcomponent_ids || []).map(uuid => <LinkToComponent uuid={uuid} />)}
    </>
}




interface LinkToComponentOwnProps
{
    uuid: string
}

const map_state = (state: RootState, props: LinkToComponentOwnProps) =>
{
    const { composed_wcomponents_by_id } = state.derived
    const derived_composed_wcomponent = composed_wcomponents_by_id[props.uuid]
    const wc_id_to_counterfactuals_map = get_wc_id_to_counterfactuals_v2_map(state)
    const knowledge_views_by_id = state.specialised_objects.knowledge_views_by_id

    const title = derived_composed_wcomponent && get_title({
        wcomponent: derived_composed_wcomponent,
        text_type: RichTextType.plain,
        wcomponents_by_id: composed_wcomponents_by_id,
        knowledge_views_by_id,
        wc_id_to_counterfactuals_map,
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
    })

    return {
        title
    }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & LinkToComponentOwnProps

function _LinkToComponent (props: Props)
{
    const { uuid, title: raw_component_title } = props

    let component_description = "a different component"
    if (raw_component_title?.trim())
    {
        const cleaned_component_title = remove_rich_text(raw_component_title.trim())
        component_description = `'${cleaned_component_title}'`
    }
    const title = "Value derived from " + component_description

    return <Link
        key={uuid}
        route={undefined}
        sub_route={undefined}
        item_id={uuid}
        args={undefined}
    >
        <AltRouteIcon
            className="material-icons"
            title={title}
            // fontSize="small"
            style={{
                fill: ALTERNATIVE_VALUE_COLOR,
                height: "16px",
            }}
        />
    </Link>
}

const LinkToComponent = connector(_LinkToComponent) as FunctionalComponent<LinkToComponentOwnProps>
