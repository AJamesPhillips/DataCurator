import type { Prediction } from "../../shared/uncertainty/interfaces"
import type { WComponentNodeBase } from "./wcomponent_base"



export interface EventAt
{
    event_at: Prediction[]
}


export interface WComponentNodeEvent extends WComponentNodeBase, Partial<EventAt> {}
