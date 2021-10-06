import type { WComponentNodeBase } from "./wcomponent_base";



type UnionKeys<T> = T extends T ? keyof T : never;
type StrictUnionHelper<T, TAll> =
    T extends any
    ? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, never>> : never;
type StrictUnion<T> = StrictUnionHelper<T, T>


interface TemporalSelector
{
    target_vap_set_id: string
}
interface ValueSelector
{
    target_value_id_type: "id" | "value_string"
    target_value: string
}

type WComponentNodeSubStateSelector = (ValueSelector & TemporalSelector) | StrictUnion<ValueSelector | TemporalSelector>



// Other potential names: WComponentNodeStateSlice, WComponentNodeStateFocus, WComponentNodeStatePoint
export interface WComponentNodeSubState extends WComponentNodeBase
{
    type: "sub_state"
    target_wcomponent_id: string
    selector: WComponentNodeSubStateSelector
}
