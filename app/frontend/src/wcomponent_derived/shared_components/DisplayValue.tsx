import { FunctionalComponent, h } from "preact"

import type { DerivedValueForUI } from "../interfaces/value"
import "./DisplayValue.css"
import { Link } from "../../sharedf/Link"
import { ALTERNATIVE_VALUE_COLOR, AltRouteIcon } from "../../sharedf/icons/AltRouteIcon"
import { ConnectedProps, connect } from "react-redux"
import { RootState } from "../../state/State"
import { get_title } from "../../sharedf/rich_text/get_rich_text"
import { get_wc_id_to_counterfactuals_v2_map } from "../../state/derived/accessor"



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

    return <>
        <span className={class_name}>{values_string}</span>
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
        rich_text: true, // TODO, rename rich_text to process_text or something
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
    const { uuid, title } = props

    return <Link
        key={uuid}
        route={undefined}
        sub_route={undefined}
        item_id={uuid}
        args={undefined}
    >
        <AltRouteIcon
            className="material-icons"
            title={"Value derived from " + (title ? `'${title}'` : "a different component")}
            // fontSize="small"
            style={{
                fill: ALTERNATIVE_VALUE_COLOR,
                height: "16px",
            }}
        />
    </Link>
}

const LinkToComponent = connector(_LinkToComponent) as FunctionalComponent<LinkToComponentOwnProps>
