
interface Base
{
    id: string
    created_at: Date
    custom_created_at?: Date
}


export interface Perception extends Base
{
    title: string
    description: string
    encompassed_by: string
}


// World Component
export type WComponent = WComponentNode | WComponentConnection | WComponentJudgement
export type WComponentsById = { [id: string]: WComponent }

type WComponentNodeType = "event" | "state" | "statev2" | "process" | "actor"
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


interface WComponentExistencePredictions
{
    existence: TemporalUncertainty[]
}

interface WComponentNodeBase extends WComponentBase, WComponentExistencePredictions
{
    type: WComponentNodeType
    encompassed_by: string
}

export interface WComponentNodeEvent extends WComponentNodeBase
{
    // event_at: TemporalUncertainty[]
}

export interface WComponentNodeState extends WComponentNodeBase
{
    // TODO remove once MVP reached (remove the conditionals)
    values?: StateValueString[]
}
export interface WComponentNodeStateV2Incremental extends WComponentNodeBase
{
    type: "statev2"
    // subtype: "string" | "boolean" | "continuous" | "categories"
    // boolean_true_str?: string
    // boolean_false_str?: string
    values_and_predictions: StateValueAndPredictionsSetIncremental[]
}
export interface WComponentNodeStateV2 extends WComponentNodeBase
{
    type: "statev2"
    // subtype: "string" | "boolean" | "continuous" | "categories"
    // boolean_true_str?: string
    // boolean_false_str?: string
    values_and_predictions: StateValueAndPredictionsSet[]
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
export interface WComponentConnection extends WComponentBase, WComponentExistencePredictions
{
    type: WComponentConnectionType
    from_id: string
    to_id: string
    from_type?: ConnectionTerminalType
    to_type?: ConnectionTerminalType
}


export interface WComponentJudgement extends WComponentBase
{
    type: "judgement"
    judgement_target_wcomponent_id: string
    judgement_operator: JudgementOperator
    judgement_comparator_value: string
    judgement_manual?: boolean
    // judgements: Judgement[]
}
type JudgementOperator = "==" | "!=" | "<" | "<=" | ">" | ">="
const _judgement_operators: {[P in JudgementOperator]: true} = {
    "==": true,
    "!=": true,
    "<": true,
    "<=": true,
    ">": true,
    ">=": true,
}
export const judgement_operators: JudgementOperator[] = Object.keys(_judgement_operators) as any


export function wcomponent_is_state (wcomponent: WComponent): wcomponent is WComponentNodeState
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

export function wcomponent_has_existence_predictions (wcomponent: WComponent): wcomponent is (WComponent & WComponentExistencePredictions)
{
    return (wcomponent as WComponentExistencePredictions).existence !== undefined
}




interface PredictionBase
{
    explanation: string
    probability: number
    conviction: number
}

export interface Prediction extends PredictionBase, Base {}


// To update a previous TemporalUncertainty value, set the ID to the same value
export interface TemporalUncertainty extends Base, PredictionBase
{
    potential: boolean

    // datetime is optional to allow modelling situations where we want to say:
    //        "an event will/has happen/happened / state will be/is true"
    //     or "could happen/could have happened"
    // but that we do not know when that will be / when it was.
    // In which cases we set the potential to true or false / undefined as required.
    //
    // For cases where we want to model "will not happen" or "has not happened"
    // we can set the datetime appropriately and set probability to 0.
    datetime: Date
    min?: Date
    max?: Date

    // TODO model dependencies that effect the earliest and latest a datetime can occur
    // TODO model process predictions that determine how long after or before a certain
    //      event this (start or end) datetime is expected to be.
}

interface TemporalUncertaintyIncremental extends Partial<TemporalUncertainty>
{
    id: string
    created_at: Date
}



interface StateValueBase extends Base
{
    start_datetime: Date
    description: string
}


export interface StateValueString extends StateValueBase
{
    value: string | null
}



interface StateValueAndPredictionsSetIncremental extends TemporalUncertaintyIncremental
{
    // If an array is provided in an incremental then it must be of the same length as "previous"
    // arrays and be populated with empty objects otherwise, or if nulll the corresponing values
    // missing will be dropped
    entries?: (Partial<StateValueAndPrediction> | null)[]
}
// Extends partial<PredictionBase> incase we have a probability, and or more likely a conviction
// for all the entries.  For example we might be applying for a grant and we have 3 different
// possible values of: fail, success: 100k, success: 500k.  The probabilities will change over
// time but at each time point the conviction for all three values will, or will likely, be the same.
// The values from partial<PredictionBase> will be used as the default values for these fields
// in all the entries.
interface StateValueAndPredictionsSet extends TemporalUncertainty
{
    entries: StateValueAndPrediction[]
}

interface StateValueAndPrediction extends Partial<PredictionBase>
{
    value: string
    value_min?: string
    value_max?: string
    description: string
    // This is not out of 100, it is the portion of the total probability that this
    // value has
    relative_probability?: number
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



export interface KnowledgeView
{
    id: string
    created_at: Date
    title: string
    description: string
    wc_id_map: { [world_component_id: string]: KnowledgeViewWComponentEntry }
    is_base?: true
}

export interface KnowledgeViewWComponentEntry
{
    // TODO remove left and top and abstract over the upside down browser coordinate system by using x and y
    left: number
    top: number
    // x: number
    // y: number
    view_ids?: string[]
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
export type SpecialisedObjectsFromToServerKeys = keyof SpecialisedObjectsFromToServer
const _specialised_objects_from_to_server_expected_keys: {[K in SpecialisedObjectsFromToServerKeys]: true} = {
    perceptions: true,
    wcomponents: true,
    knowledge_views: true,
}
export const specialised_objects_from_to_server_expected_keys: (SpecialisedObjectsFromToServerKeys)[] = Object.keys(_specialised_objects_from_to_server_expected_keys) as any
