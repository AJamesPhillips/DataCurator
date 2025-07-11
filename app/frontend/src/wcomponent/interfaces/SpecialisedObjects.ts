import type { KnowledgeView } from "../../shared/interfaces/knowledge_view"
import type { WComponentNodeAction } from "./action"
import type { WComponentCounterfactualV2 } from "./counterfactual"
import type { EventAt, WComponentNodeEvent } from "./event"
import type {
    HasValuePossibilities,
    HasVAPSetsAndMaybeValuePossibilities,
    StateValueAndPredictionsSet,
    WComponentNodeStateV2,
    WComponentStateValue,
} from "./state"
import type {
    WComponentBase,
    WComponentCalculations,
    WComponentConnectionType,
    WComponentNodeBase,
    WComponentType,
} from "./wcomponent_base"



// World Component
export type WComponent = WComponentNode | WComponentConnection | WComponentCausalConnection
type WComponentCommonKeys = Exclude<keyof WComponentNode & keyof WComponentConnection & keyof WComponentCausalConnection, "type">
export type WComponentCommon = {
    [K in WComponentCommonKeys]: WComponentNode[K] | WComponentConnection[K] | WComponentCausalConnection[K]
}
export type PartialWComponentWithoutType = Partial<WComponent> & { type?: undefined }

export type WComponentsById = { [id: string]: WComponent /*| undefined*/ }



export interface WComponentNodeProcess extends WComponentNodeBase, WComponentNodeProcessBase
{
    type: "process"
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface WComponentNodeProcessBase
{
    // active: ProcessActiveStatus[]
    // end: TemporalUncertainty
}


// TODO expand this list and add a test to make it robust to additions / deletions / changes
export type WComponentNode = WComponentNodeEvent
    | WComponentNodeStateV2
    | WComponentStateValue
    | WComponentNodeProcess
    | WComponentNodeAction



export type ConnectionTerminalAttributeType = "meta" | "validity" | "state"
export const connection_terminal_attributes: ConnectionTerminalAttributeType[] = ["meta", "validity", "state"]
export type ConnectionTerminalSideType = "right" | "left"
export const connection_terminal_sides: ConnectionTerminalSideType[] = ["right", "left"]
export interface ConnectionTerminalType
{
    attribute: ConnectionTerminalAttributeType
    side: ConnectionTerminalSideType
}


// Should move this to the canvas perhaps?
export enum ConnectionLineBehaviour {
    curve = "curve",
    straight = "straight",
    angular = "angular",
} // | "heirarchy"
export const connection_line_behaviours: ConnectionLineBehaviour[] = [
    ConnectionLineBehaviour.curve,
    ConnectionLineBehaviour.straight,
    ConnectionLineBehaviour.angular,
]//, "heirarchy"]
// export type ConnectionDirectionType = "normal" | "reverse" | "bidirectional"
export interface WComponentConnection extends WComponentBase, Partial<HasVAPSetsAndMaybeValuePossibilities>
{
    type: WComponentConnectionType
    from_id: string
    to_id: string
    from_type: ConnectionTerminalAttributeType
    to_type: ConnectionTerminalAttributeType

    line_behaviour?: ConnectionLineBehaviour
    line_number?: number
}
export interface WComponentCausalConnection extends WComponentConnection
{
    type: "causal_link"
    // We want to capture simulation.js/InsightMaker Flow "effects" so we
    // we need use a string for this and then calculate the value to go into
    // "effect_when_true" and "effect_when_false"
    effect_string?: string
    effect_when_true?: number
    effect_when_false?: number
}


export function is_a_wcomponent (wcomponent: WComponent | undefined): wcomponent is WComponent
{
    return !!wcomponent
}


export function wcomponent_is_event (wcomponent: WComponent | undefined): wcomponent is WComponentNodeEvent
{
    return wcomponent_is_a("event", wcomponent)
}


export function wcomponent_is_statev2 (wcomponent: WComponent | undefined): wcomponent is WComponentNodeStateV2
{
    return wcomponent_is_a("statev2", wcomponent)
}

export function wcomponent_is_state_value (wcomponent: WComponent | undefined, log_error_id = ""): wcomponent is WComponentStateValue
{
    return wcomponent_is_a("state_value", wcomponent, log_error_id)
}


export function wcomponent_is_process (wcomponent: WComponent | undefined): wcomponent is WComponentNodeProcess
{
    return wcomponent_is_a("process", wcomponent)
}


// * log_error_id   Accepts number so that downstream functions can use it as a type guard
//                  in array.filter()  If a number is given it will be ignored.
function wcomponent_is_a (type: WComponentType, wcomponent: WComponent | undefined, log_error_id: number | string = "")
{
    let yes = false
    log_error_id = (typeof log_error_id === "string") ? log_error_id : ""

    if (!wcomponent)
    {
        if (log_error_id)
        {
            console.error(`wcomponent with id "${log_error_id}" does not exist`)
        }
    }
    else if (wcomponent.type !== type)
    {
        if (log_error_id)
        {
            console.error(`wcomponent with id "${log_error_id}" is not a ${type}`)
        }
    }
    else yes = true

    return yes
}



export function wcomponent_is_action (wcomponent: WComponent | undefined, log_error_id: number | string = ""): wcomponent is WComponentNodeAction
{
    return wcomponent_is_a("action", wcomponent, log_error_id)
}


export function wcomponent_is_causal_link (wcomponent: WComponent | undefined): wcomponent is WComponentCausalConnection
{
    return wcomponent_is_a("causal_link", wcomponent)
}

function wcomponent_is_relation_link (wcomponent: WComponent | undefined)
{
    return wcomponent_is_a("relation_link", wcomponent)
}

export function wcomponent_is_plain_connection (wcomponent: WComponent | undefined): wcomponent is WComponentConnection
{
    return wcomponent_is_causal_link(wcomponent) || wcomponent_is_relation_link(wcomponent)
}
export function wcomponent_type_is_plain_connection(wcomponent_type: WComponentType)
{
    return wcomponent_type === "causal_link" || wcomponent_type === "relation_link"
}


export function wcomponent_is_node (wcomponent: WComponent | undefined): wcomponent is WComponentNode
{
    return (
        // TODO expand this list and add a test to make it robust to additions / deletions / changes
        wcomponent_is_event(wcomponent) ||
        wcomponent_is_statev2(wcomponent) ||
        wcomponent_is_process(wcomponent) ||
        wcomponent_is_action(wcomponent) ||
        wcomponent_is_state_value(wcomponent) ||
        wcomponent_is_counterfactual_v2(wcomponent)
    )
}


export function wcomponent_is_counterfactual_v2 (wcomponent: WComponent | undefined, log_error_id = ""): wcomponent is WComponentCounterfactualV2
{
    return wcomponent_is_a("counterfactualv2", wcomponent, log_error_id)
}



export function wcomponent_can_render_connection (wcomponent: WComponent): wcomponent is WComponentConnection
{
    return wcomponent_is_plain_connection(wcomponent)
}

export function wcomponent_has_event_at (wcomponent: WComponent): wcomponent is (WComponent & EventAt)
{
    return (wcomponent as Partial<EventAt>).event_at !== undefined
}


export function wcomponent_is_deleted (wcomponent: WComponent | undefined)
{
    return wcomponent ? wcomponent.deleted_at !== undefined : undefined
}
export function wcomponent_is_not_deleted (wcomponent: WComponent | undefined)
{
    return wcomponent ? wcomponent.deleted_at === undefined : undefined
}


export function wcomponent_has_VAP_sets (wcomponent: WComponent): wcomponent is (WComponent & { values_and_prediction_sets: StateValueAndPredictionsSet[] })
{
    return (wcomponent as WComponentNodeStateV2).values_and_prediction_sets !== undefined
}
export function wcomponent_has_value_possibilities (wcomponent: WComponent | undefined): wcomponent is (WComponent & HasValuePossibilities)
{
    return (wcomponent as HasValuePossibilities | undefined)?.value_possibilities !== undefined
}



// Need to keep in sync with wc_ids_by_type.any_state_VAPs
export type WComponentIsAllowedToHaveStateVAPSets = WComponent & HasVAPSetsAndMaybeValuePossibilities
export function wcomponent_is_allowed_to_have_state_VAP_sets (wcomponent: WComponent | undefined): wcomponent is (WComponentIsAllowedToHaveStateVAPSets)
{
    return wcomponent_is_statev2(wcomponent)
        || wcomponent_is_state_value(wcomponent)
        // Removing ability to edit causal link state as:
        // 1. I do not remember editing the VAP sets of a causal link -- if it is used we should put a description
        //    here of the scenario that needs it
        // 2. There is already the "Effect when true/false" data
        // 3. We already know we need to support some kind of equation like InsightMaker / OpenModelica and not a
        //    static value which does not tell the receiving node how to handle and combine multiple values
        //    together
        // || wcomponent_is_causal_link(wcomponent)
        || wcomponent_is_action(wcomponent)
}



export function wcomponent_has_legitimate_non_empty_state_VAP_sets (wcomponent: WComponent): wcomponent is (WComponentIsAllowedToHaveStateVAPSets)
{
    return wcomponent_has_VAP_sets(wcomponent) && wcomponent.values_and_prediction_sets.length > 0 && wcomponent_is_allowed_to_have_state_VAP_sets(wcomponent)
}


export function wcomponent_has_calculations (wcomponent: WComponent): wcomponent is (WComponentNodeBase & WComponentCalculations)
{
    return (wcomponent as Partial<WComponentCalculations>).calculations !== undefined
}

export function wcomponent_allowed_calculations (wcomponent: WComponent): wcomponent is (WComponentNodeBase & Partial<WComponentCalculations>)
{
    return wcomponent_is_statev2(wcomponent) || wcomponent_is_action(wcomponent)
}



export interface SpecialisedObjectsFromToServer
{
    wcomponents: WComponent[]
    knowledge_views: KnowledgeView[]
}

// Used on the server
export type SpecialisedObjectsFromToServerKeys = keyof SpecialisedObjectsFromToServer
const _specialised_objects_from_to_server_expected_keys: {[K in SpecialisedObjectsFromToServerKeys]: true} = {
    wcomponents: true,
    knowledge_views: true,
}
// Used on the server
export const specialised_objects_from_to_server_expected_keys = Object.keys(_specialised_objects_from_to_server_expected_keys) as SpecialisedObjectsFromToServerKeys[]
