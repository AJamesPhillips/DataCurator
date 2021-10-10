import type { StartedStoppedAt, WComponentNodeAction } from "./action"
import type { Base } from "../../shared/interfaces/base"
import type { EventAt, WComponentNodeEvent } from "./event"
import type { WComponentNodeGoal } from "./goal"
import type { WComponentJudgement } from "./judgement"
import type { KnowledgeView } from "../../shared/interfaces/knowledge_view"
import type {
    HasVAPSetsAndMaybeValuePossibilities,
    StateValueAndPredictionsSet,
    WComponentNodeStateV2,
} from "./state"
import type { ExistencePredictions } from "../../shared/uncertainty/existence"
import type { ValidityPredictions } from "../../shared/uncertainty/validity"
import type { WComponentBase, WComponentConnectionType, WComponentNodeBase, WComponentType } from "./wcomponent_base"
import type { WComponentPrioritisation } from "./priorities"
import type { WComponentCounterfactualV2 } from "./counterfactual"
import type { WComponentSubState } from "./substate"



export interface Perception extends Base
{
    title: string
    description: string
    encompassed_by: string
}


// World Component
export type WComponent = WComponentNode | WComponentConnection | WComponentCausalConnection | WComponentJudgement | WComponentPrioritisation
type WComponentCommonKeys = Exclude<keyof WComponentNode & keyof WComponentConnection & keyof WComponentCausalConnection & keyof WComponentJudgement & keyof WComponentPrioritisation, "type">
export type WComponentCommon = {
    [K in WComponentCommonKeys]: WComponentNode[K] | WComponentConnection[K] | WComponentCausalConnection[K] | WComponentJudgement[K] | WComponentPrioritisation[K]
}

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


export type WComponentNode = WComponentNodeEvent
    | WComponentNodeStateV2
    | WComponentNodeProcess
    | WComponentNodeAction
    | WComponentNodeGoal



export type ConnectionTerminalAttributeType = "meta" | "validity" | "state" // | "existence"
export const connection_terminal_attributes: ConnectionTerminalAttributeType[] = ["meta", "validity", "state"]
export type ConnectionTerminalDirectionType = "from" | "to"
export const connection_terminal_directions: ConnectionTerminalDirectionType[] = ["from", "to"]
export interface ConnectionTerminalType
{
    attribute: ConnectionTerminalAttributeType
    direction: ConnectionTerminalDirectionType
}


// export type ConnectionDirectionType = "normal" | "reverse" | "bidirectional"
export interface WComponentConnection extends WComponentBase, Partial<ValidityPredictions>, Partial<ExistencePredictions>, Partial<HasVAPSetsAndMaybeValuePossibilities>
{
    type: WComponentConnectionType
    from_id: string
    to_id: string
    from_type: ConnectionTerminalAttributeType
    to_type: ConnectionTerminalAttributeType
}
export interface WComponentCausalConnection extends WComponentConnection
{
    type: "causal_link"
    effect_when_true?: number
    effect_when_false?: number
}


export function wcomponent_is_event (wcomponent: WComponent | undefined): wcomponent is WComponentNodeEvent
{
    return wcomponent_is_a("event", wcomponent)
}


export function wcomponent_is_statev2 (wcomponent: WComponent | undefined): wcomponent is WComponentNodeStateV2
{
    return wcomponent_is_a("statev2", wcomponent)
}

export function wcomponent_is_process (wcomponent: WComponent | undefined): wcomponent is WComponentNodeProcess
{
    return wcomponent_is_a("process", wcomponent)
}
export function wcomponent_is_action (wcomponent: WComponent | undefined): wcomponent is WComponentNodeAction
{
    return wcomponent_is_a("action", wcomponent)
}


function wcomponent_is_a (type: WComponentType, wcomponent: WComponent | undefined, log_error_id = "")
{
    let yes = false

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


export function wcomponent_is_goal (wcomponent: WComponent | undefined): wcomponent is WComponentNodeGoal
{
    return wcomponent_is_a("goal", wcomponent)
}
export function alert_wcomponent_is_goal (wcomponent: WComponent | undefined, log_error_id: string): wcomponent is WComponentNodeGoal
{
    return wcomponent_is_a("goal", wcomponent, log_error_id)
}


export function wcomponent_is_prioritisation (wcomponent: WComponent | undefined): wcomponent is WComponentPrioritisation
{
    return wcomponent_is_a("prioritisation", wcomponent)
}
export function alert_wcomponent_is_prioritisation (wcomponent: WComponent | undefined, log_error_id: string): wcomponent is WComponentPrioritisation
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



export function wcomponent_is_judgement_or_objective (wcomponent: WComponent | undefined): wcomponent is WComponentJudgement
{
    return wcomponent_is_a("judgement", wcomponent) || wcomponent_is_a("objective", wcomponent)
}
export function alert_wcomponent_is_judgement_or_objective (wcomponent: WComponent | undefined, log_error_id: string): wcomponent is WComponentJudgement
{
    const result = wcomponent_is_a("judgement", wcomponent) || wcomponent_is_a("objective", wcomponent)

    if (!result && log_error_id)
    {
        if (!wcomponent) console.error(`wcomponent with id "${log_error_id}" does not exist`)
        else console.error(`wcomponent with id "${log_error_id}" is not a judgement or objective`)
    }

    return result
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


export function wcomponent_has_validity_predictions (wcomponent: WComponent): wcomponent is (WComponent & ValidityPredictions)
{
    const { validity } = wcomponent as ValidityPredictions
    return validity !== undefined && validity.length > 0
}
const types_without_validity: Set<WComponentType> = new Set([
    "prioritisation",
    "counterfactualv2",
    "sub_state",
])
export function wcomponent_can_have_validity_predictions (wcomponent: WComponent): wcomponent is (WComponent & Partial<ValidityPredictions>)
{
    return !types_without_validity.has(wcomponent.type)
}


export function wcomponent_has_existence_predictions (wcomponent: WComponent): wcomponent is (WComponent & ExistencePredictions)
{
    return (wcomponent as ExistencePredictions).existence !== undefined
}


export function wcomponent_has_VAP_sets (wcomponent: WComponent): wcomponent is (WComponent & { values_and_prediction_sets: StateValueAndPredictionsSet[] })
{
    return (wcomponent as WComponentNodeStateV2).values_and_prediction_sets !== undefined
}
// export function wcomponent_has_value_possibilities (wcomponent: WComponent): wcomponent is (WComponent & { value_possibilities: ValuePossibilitiesById })
// {
//     return (wcomponent as WComponentNodeStateV2).value_possibilities !== undefined
// }


// TODO refactor this to use the action's VAPs?
export function wcomponent_has_started_stopped_at (wcomponent: WComponent): wcomponent is (WComponent & StartedStoppedAt)
{
    return (wcomponent as WComponentNodeAction).started_at !== undefined || (wcomponent as WComponentNodeAction).stopped_at !== undefined
}



export function wcomponent_should_have_state_VAP_sets (wcomponent: WComponent | undefined): wcomponent is (WComponent & HasVAPSetsAndMaybeValuePossibilities)
{
    return wcomponent_is_statev2(wcomponent) || wcomponent_is_causal_link(wcomponent) || wcomponent_is_action(wcomponent)
}



export function wcomponent_has_legitimate_non_empty_state_VAP_sets (wcomponent: WComponent): wcomponent is (WComponent & HasVAPSetsAndMaybeValuePossibilities)
{
    return wcomponent_has_VAP_sets(wcomponent) && wcomponent.values_and_prediction_sets.length > 0 && wcomponent_should_have_state_VAP_sets(wcomponent)
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
    perceptions: Perception[]
    wcomponents: WComponent[]
    knowledge_views: KnowledgeView[]
}

// Used on the server
export type SpecialisedObjectsFromToServerKeys = keyof SpecialisedObjectsFromToServer
const _specialised_objects_from_to_server_expected_keys: {[K in SpecialisedObjectsFromToServerKeys]: true} = {
    perceptions: true,
    wcomponents: true,
    knowledge_views: true,
}
// Used on the server
export const specialised_objects_from_to_server_expected_keys: (SpecialisedObjectsFromToServerKeys)[] = Object.keys(_specialised_objects_from_to_server_expected_keys) as any
