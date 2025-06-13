import type { WComponentCounterfactualV2 } from "../../wcomponent/interfaces/counterfactual"



export type WcIdToCounterfactualsV2Map = {
    [target_wcomponent_id: string]: WcCounterfactualsByAttribute
}
interface WcCounterfactualsByAttribute {
    VAP_sets: VAPSetIdToCounterfactualV2Map
}
export interface VAPSetIdToCounterfactualV2Map
{
    [target_VAP_set_id: string]: WComponentCounterfactualV2[]
}
