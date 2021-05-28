import type { Prediction } from "./uncertainty/uncertainty"
import type { WComponentNodeBase } from "./wcomponent_base"



export interface EventAt
{
    event_at: Prediction[]
}


export interface WComponentNodeEvent extends WComponentNodeBase, Partial<EventAt> {}
