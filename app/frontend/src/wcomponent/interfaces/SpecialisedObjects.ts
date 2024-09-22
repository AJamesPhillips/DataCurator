import type { WComponentNodeAction } from "./action"
// import type { Base } from "../../shared/interfaces/base"
import type { EventAt, WComponentNodeEvent } from "./event"
import type { WComponentNodeGoal } from "./goal"
import type { HasObjectives, WComponentJudgement } from "./judgement"
import type { KnowledgeView } from "../../shared/interfaces/knowledge_view"
import type {
    HasValuePossibilities,
    HasVAPSetsAndMaybeValuePossibilities,
    StateValueAndPredictionsSet,
    WComponentNodeStateV2,
    WComponentStateValue,
} from "./state"
import type { ValidityPredictions } from "../../shared/uncertainty/validity"
import type {
    WComponentBase,
    WComponentCalculations,
    WComponentConnectionType,
    WComponentNodeBase,
    WComponentType,
} from "./wcomponent_base"
import type { WComponentPrioritisation } from "./priorities"
import type { WComponentCounterfactualV2 } from "./counterfactual"
import type { WComponentSubState } from "./substate"



// World Component
export type WComponent = WComponentNode | WComponentConnection | WComponentCausalConnection | WComponentJudgement | WComponentPrioritisation
type WComponentCommonKeys = Exclude<keyof WComponentNode & keyof WComponentConnection & keyof WComponentCausalConnection & keyof WComponentJudgement & keyof WComponentPrioritisation, "type">
export type WComponentCommon = {
    [K in WComponentCommonKeys]: WComponentNode[K] | WComponentConnection[K] | WComponentCausalConnection[K] | WComponentJudgement[K] | WComponentPrioritisation[K]
}
export type PartialWComponentWithoutType = Partial<WComponent> & { type?: undefined }

export type WComponentsById = { [id: string]: WComponent /*| undefined*/ }



export interface WComponentNodeProcess extends WComponentNodeBase, WComponentNodeProcessBase
{
    type: "process"
}
interface WComponentNodeProcessBase
{
    // active: ProcessActiveStatus[]
    // end: TemporalUncertainty
}


// TODO expand this list and add a test to make it robust to additions / deletions / changes
export type WComponentNode = WComponentNodeEvent
    | WComponentNodeStateV2
    | WComponentSubState
    | WComponentStateValue
    | WComponentNodeProcess
    | WComponentNodeAction
    | WComponentNodeGoal



export type ConnectionTerminalAttributeType = "meta" | "validity" | "state"
export const connection_terminal_attributes: ConnectionTerminalAttributeType[] = ["meta", "validity", "state"]
export type ConnectionTerminalDirectionType = "from" | "to"
export const connection_terminal_directions: ConnectionTerminalDirectionType[] = ["from", "to"]
export interface ConnectionTerminalType
{
    attribute: ConnectionTerminalAttributeType
    direction: ConnectionTerminalDirectionType
}


// Should move this to the canvas perhaps?
export type ConnectionLineBehaviour = "curve" | "straight" // | "heirarchy"
export const connection_line_behaviours: ConnectionLineBehaviour[] = ["curve", "straight"]//, "heirarchy"]
// export type ConnectionDirectionType = "normal" | "reverse" | "bidirectional"
export interface WComponentConnection extends WComponentBase, Partial<ValidityPredictions>, Partial<HasVAPSetsAndMaybeValuePossibilities>
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

export function wcomponent_is_goal (wcomponent: WComponent | undefined, log_error_id: number | string = ""): wcomponent is WComponentNodeGoal
{
    return wcomponent_is_a("goal", wcomponent, log_error_id)
}

// Need to keep in sync with wc_ids_by_type.has_objectives
export function wcomponent_has_objectives (wcomponent: WComponent | undefined, log_error_id: number | string = ""): wcomponent is WComponent & HasObjectives
{
    return wcomponent_is_action(wcomponent, undefined) || wcomponent_is_goal(wcomponent, log_error_id)
}



export function wcomponent_is_prioritisation (wcomponent: WComponent | undefined, log_error_id: number | string = ""): wcomponent is WComponentPrioritisation
{
    return wcomponent_is_a("prioritisation", wcomponent, log_error_id)
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
        wcomponent_is_goal(wcomponent) ||
        wcomponent_is_sub_state(wcomponent) ||
        wcomponent_is_state_value(wcomponent) ||
        wcomponent_is_counterfactual_v2(wcomponent) ||
        wcomponent_is_prioritisation(wcomponent)
    )
}


export function wcomponent_is_judgement_or_objective (wcomponent: WComponent | undefined, log_error_id: number | string = ""): wcomponent is WComponentJudgement
{
    return wcomponent_is_a("judgement", wcomponent, undefined) || wcomponent_is_a("objective", wcomponent, log_error_id)
}
export function wcomponent_is_objective (wcomponent: WComponent): wcomponent is WComponentJudgement
{
    return wcomponent_is_a("objective", wcomponent)
}



export function wcomponent_is_sub_state (wcomponent: WComponent | undefined, log_error_id = ""): wcomponent is WComponentSubState
{
    return wcomponent_is_a("sub_state", wcomponent, log_error_id)
}



export function wcomponent_is_counterfactual_v2 (wcomponent: WComponent | undefined, log_error_id = ""): wcomponent is WComponentCounterfactualV2
{
    return wcomponent_is_a("counterfactualv2", wcomponent, log_error_id)
}



export function wcomponent_can_render_connection (wcomponent: WComponent): wcomponent is WComponentConnection | WComponentJudgement
{
    return wcomponent_is_plain_connection(wcomponent) // || wcomponent_is_judgement_or_objective(wcomponent)
}

export function wcomponent_has_event_at (wcomponent: WComponent): wcomponent is (WComponent & EventAt)
{
    return (wcomponent as EventAt).event_at !== undefined
}


export function wcomponent_is_deleted (wcomponent: WComponent | undefined)
{
    return wcomponent ? wcomponent.deleted_at !== undefined : undefined
}
export function wcomponent_is_not_deleted (wcomponent: WComponent | undefined)
{
    return wcomponent ? wcomponent.deleted_at === undefined : undefined
}


export function wcomponent_has_validity_predictions (wcomponent: WComponent): wcomponent is (WComponent & ValidityPredictions)
{
    const { validity } = wcomponent as ValidityPredictions
    return validity !== undefined && validity.length > 0
}
const types_without_validity = new Set<WComponentType>([
    "prioritisation",
    "counterfactualv2",
    "sub_state",
])
export type WComponentCanHaveValidityPredictions = WComponent & Partial<ValidityPredictions>
export function wcomponent_can_have_validity_predictions (wcomponent: WComponent): wcomponent is WComponentCanHaveValidityPredictions
{
    return !types_without_validity.has(wcomponent.type)
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

// export interface JudgementView
// {
//     id: string
//     created_at: Date
//     target_knowledge_view_id: string
//     last_used_at: Date // used when deciding between which of multiple judgement layers to show by default
//     title: string
//     description: string
//     judgement_wcomponent_ids: Set<string>
// }


// type ObjectiveID = string
// // type ObjectiveType = "value" | "process" | "event"
// interface Objective
// {
//     id: ObjectiveID
//     created_at: Date
//     custom_created_at?: Date
//     component_id: WComponentID
//     // title: string
//     // description: string
//     // type:
// }


type PlanID = string
// interface Plan
// {
//     id: PlanID
//     created_at: Date
//     custom_created_at?: Date
//     title: string
//     description: string

// }


// type PriorityID = string
// interface Priority
// {
//     id: PriorityID
//     created_at: Date
//     custom_created_at?: Date
//     title: string
//     description: string

// }


type ActionID = string
// interface Action
// {
//     id: ActionID
//     created_at: Date
//     custom_created_at?: Date
//     title: string
//     description: string

// }



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
export const specialised_objects_from_to_server_expected_keys: (SpecialisedObjectsFromToServerKeys)[] = Object.keys(_specialised_objects_from_to_server_expected_keys) as any
