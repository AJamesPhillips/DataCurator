import type { StartedStoppedAt, WComponentNodeAction } from "./action"
import type { Base } from "./base"
import type { EventAt, WComponentNodeEvent } from "./event"
import type { WComponentNodeGoal } from "./goal"
import type { WComponentJudgement } from "./judgement"
import type { KnowledgeView } from "./knowledge_view"
import type {
    HasVAPSets,
    StateValueAndPredictionsSet,
    StateValueString,
    WComponentNodeState,
    WComponentNodeStateV2,
} from "./state"
import type { ExistencePredictions } from "../../uncertainty/existence"
import type { ValidityPredictions } from "../../uncertainty/validity"
import type { WComponentBase, WComponentConnectionType, WComponentNodeBase, WComponentType } from "./wcomponent_base"
import type { WComponentPrioritisation } from "./priorities"
import type { WComponentCounterfactual, WComponentCounterfactualV2 } from "./counterfactual"



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
    | WComponentNodeState
    | WComponentNodeStateV2
    | WComponentNodeProcess
    | WComponentNodeAction
    | WComponentCounterfactual
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
export interface WComponentConnection extends WComponentBase, Partial<ValidityPredictions>, Partial<ExistencePredictions>, Partial<HasVAPSets>
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


export function wcomponent_is_event (wcomponent: WComponent): wcomponent is WComponentNodeEvent
{
    return wcomponent.type === "event"
}

export function wcomponent_is_state (wcomponent: WComponent | undefined): wcomponent is WComponentNodeState | WComponentNodeStateV2
{
    if (!wcomponent) return false
    return wcomponent.type === "state" || wcomponent.type === "statev2"
}
export function wcomponent_is_statev1 (wcomponent: WComponent): wcomponent is WComponentNodeState
{
    return wcomponent.type === "state"
}
export function wcomponent_is_statev2 (wcomponent: WComponent): wcomponent is WComponentNodeStateV2
{
    return wcomponent.type === "statev2"
}

export function wcomponent_is_process (wcomponent: WComponent): wcomponent is WComponentNodeProcess
{
    return wcomponent.type === "process"
}
export function wcomponent_is_action (wcomponent: WComponent): wcomponent is WComponentNodeAction
{
    return wcomponent.type === "action"
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


export function wcomponent_is_causal_link (wcomponent: WComponent): wcomponent is WComponentCausalConnection
{
    return wcomponent.type === "causal_link"
}

function wcomponent_is_relation_link (wcomponent: WComponent)
{
    return wcomponent.type === "relation_link"
}

export function wcomponent_is_plain_connection (wcomponent: WComponent): wcomponent is WComponentConnection
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
    return wcomponent.type === "objective"
}


export function wcomponent_is_counterfactual (wcomponent: WComponent | undefined, log_error_id = ""): wcomponent is WComponentCounterfactual
{
    return wcomponent_is_a("counterfactual", wcomponent, log_error_id)
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
    return (wcomponent as ValidityPredictions).validity !== undefined
}
const types_without_validity: Set<WComponentType> = new Set([
    "prioritisation",
    "counterfactual",
])
export function wcomponent_can_have_validity_predictions (wcomponent: WComponent): wcomponent is (WComponent & ValidityPredictions)
{
    return !types_without_validity.has(wcomponent.type)
}


export function wcomponent_has_existence_predictions (wcomponent: WComponent): wcomponent is (WComponent & ExistencePredictions)
{
    return (wcomponent as ExistencePredictions).existence !== undefined
}

export function wcomponent_has_statev1_values (wcomponent: WComponent): wcomponent is (WComponent & { values: StateValueString[] })
{
    return (wcomponent as WComponentNodeState).values !== undefined
}

export function wcomponent_has_VAP_sets (wcomponent: WComponent): wcomponent is (WComponent & { values_and_prediction_sets: StateValueAndPredictionsSet[] })
{
    return (wcomponent as WComponentNodeStateV2).values_and_prediction_sets !== undefined
}


export function wcomponent_has_started_stopped_at (wcomponent: WComponent): wcomponent is (WComponent & StartedStoppedAt)
{
    return (wcomponent as WComponentNodeAction).started_at !== undefined || (wcomponent as WComponentNodeAction).stopped_at !== undefined
}


export function wcomponent_should_have_state (wcomponent: WComponent)
{
    return wcomponent_is_state(wcomponent) || wcomponent_should_have_state_VAP_sets(wcomponent)
}


export function wcomponent_should_have_state_VAP_sets (wcomponent: WComponent): wcomponent is (WComponent & { values_and_prediction_sets: StateValueAndPredictionsSet[] })
{
    return wcomponent_is_statev2(wcomponent) || wcomponent_is_causal_link(wcomponent) || wcomponent_is_action(wcomponent)
}



export function wcomponent_has_legitimate_non_empty_statev1 (wcomponent: WComponent): wcomponent is (WComponent & { values_and_prediction_sets: StateValueAndPredictionsSet[] })
{
    return wcomponent_has_statev1_values(wcomponent) && wcomponent.values.length > 0 && wcomponent_is_statev1(wcomponent)
}


export function wcomponent_has_legitimate_non_empty_VAP_sets (wcomponent: WComponent): wcomponent is (WComponent & { values_and_prediction_sets: StateValueAndPredictionsSet[] })
{
    return wcomponent_has_VAP_sets(wcomponent) && wcomponent.values_and_prediction_sets.length > 0 && wcomponent_should_have_state_VAP_sets(wcomponent)
}

export function wcomponent_has_legitimate_non_empty_state (wcomponent: WComponent)
{
    return wcomponent_has_legitimate_non_empty_VAP_sets(wcomponent)
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
