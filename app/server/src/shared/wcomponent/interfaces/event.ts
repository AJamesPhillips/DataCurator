import type { Prediction } from "./uncertainty"
import type { WComponentNodeBase } from "./wcomponent"



export interface EventAt
{
    event_at: Prediction[]
}


export interface WComponentNodeEvent extends WComponentNodeBase, Partial<EventAt> {}
