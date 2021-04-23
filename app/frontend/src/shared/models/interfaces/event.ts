import type { Prediction } from "./uncertainty"
import type { WComponentNodeBase } from "./wcomponent"



export interface WComponentNodeEvent extends WComponentNodeBase
{
    event_at?: Prediction[]
}
