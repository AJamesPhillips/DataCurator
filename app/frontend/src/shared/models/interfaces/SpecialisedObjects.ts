import type { Base } from "./base"
import type { EventAt, WComponentNodeEvent } from "./event"
import type { WComponentJudgement } from "./judgement"
import type {
    StateValueAndPredictionsSet,
    StateValueString,
    WComponentNodeState,
    WComponentNodeStateV2,
} from "./state"
import type { ValidityPredictions, ExistencePredictions } from "./uncertainty"
import type { WComponentNodeBase, WComponentNodeType } from "./wcomponent"



export interface Perception extends Base
{
    title: string
    description: string
    encompassed_by: string
}


// World Component
export type WComponent = WComponentNode | WComponentConnection | WComponentJudgement
export type WComponentsById = { [id: string]: WComponent /*| undefined*/ }


type WComponentConnectionType = "causal_link" | "relation_link"
export type WComponentType = WComponentNodeType | WComponentConnectionType | "judgement"
const _wcomponent_types: {[P in WComponentType]: true} = {
    event: true,
    state: true,
    statev2: true,
    process: true,
    actor: true,
    causal_link: true,
    relation_link: true,
    judgement: true,
}
export const wcomponent_types: WComponentType[] = Object.keys(_wcomponent_types) as any


export interface WComponentBase extends Base
{
    type: WComponentType
    // previous_versions: WComponentID[] // could be formed from more than one previous WComponent
    // next_versions: WComponentID[] // more than one next WComponent could be formed from this

    // Explainable
    title: string
    description: string
}


export interface WComponentNodeProcess extends WComponentNodeBase
{
    // active: ProcessActiveStatus[]
    // end: TemporalUncertainty
}

export type WComponentNode = WComponentNodeEvent | WComponentNodeState | WComponentNodeStateV2 | WComponentNodeProcess


export type ConnectionLocationType = "top" | "bottom" | "left" | "right"
export type ConnectionTerminalType = "effector" | "effected" | "meta-effector" | "meta-effected"
// export type ConnectionDirectionType = "normal" | "reverse" | "bidirectional"
export interface WComponentConnection extends WComponentBase, Partial<ValidityPredictions>, Partial<ExistencePredictions>
{
    type: WComponentConnectionType
    from_id: string
    to_id: string
    from_type?: ConnectionTerminalType
    to_type?: ConnectionTerminalType
}


export function wcomponent_is_event (wcomponent: WComponent): wcomponent is WComponentNodeEvent
{
    return wcomponent.type === "event"
}

export function wcomponent_is_state (wcomponent: WComponent): wcomponent is WComponentNodeState | WComponentNodeStateV2
{
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

function wcomponent_is_causal_link (wcomponent: WComponent)
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

export function wcomponent_is_judgement (wcomponent: WComponent): wcomponent is WComponentJudgement
{
    return wcomponent.type === "judgement"
}

export function wcomponent_can_render_connection (wcomponent: WComponent): wcomponent is WComponentConnection | WComponentJudgement
{
    return wcomponent_is_plain_connection(wcomponent) || wcomponent_is_judgement(wcomponent)
}

export function wcomponent_has_event_at (wcomponent: WComponent): wcomponent is (WComponent & EventAt)
{
    return (wcomponent as EventAt).event_at !== undefined
}

export function wcomponent_has_validity_predictions (wcomponent: WComponent): wcomponent is (WComponent & ValidityPredictions)
{
    return (wcomponent as ValidityPredictions).validity !== undefined
}

export function wcomponent_has_existence_predictions (wcomponent: WComponent): wcomponent is (WComponent & ExistencePredictions)
{
    return (wcomponent as ExistencePredictions).existence !== undefined
}

export function wcomponent_has_values (wcomponent: WComponent): wcomponent is (WComponent & { values: StateValueString[] })
{
    return (wcomponent as WComponentNodeState).values !== undefined
}

export function wcomponent_has_VAPs (wcomponent: WComponent): wcomponent is (WComponent & { values_and_prediction_sets: StateValueAndPredictionsSet[] })
{
    return (wcomponent as WComponentNodeStateV2).values_and_prediction_sets !== undefined
}


// interface ProcessActiveStatus extends StateValueBase
// {
//     active: boolean | null
// }


// export interface Judgement extends StateValueBase
// {
//     value: boolean | null
//     // degree: "borderline" | "minor" | "moderate" | "significant" | "extreme"
// }

export interface KnowledgeViewWComponentIdEntryMap
{
    [world_component_id: string]: KnowledgeViewWComponentEntry
}

export interface KnowledgeView
{
    id: string
    created_at: Date
    title: string
    description: string
    wc_id_map: KnowledgeViewWComponentIdEntryMap
    is_base?: true
    allows_assumptions?: true
    foundation_knowledge_view_ids?: string[]
}
export type KnowledgeViewsById = { [id: string]: KnowledgeView /*| undefined*/ }

export interface KnowledgeViewWComponentEntry
{
    // TODO remove left and top and abstract over the upside down browser coordinate system by using x and y
    left: number
    top: number
    // x: number
    // y: number
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
