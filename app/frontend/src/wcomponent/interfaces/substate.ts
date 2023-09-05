import type { WComponentNodeBase } from "./wcomponent_base"



type UnionKeys<T> = T extends T ? keyof T : never
type StrictUnionHelper<T, TAll> =
    T extends any
    ? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, never>> : never
type StrictUnion<T> = StrictUnionHelper<T, T>


interface TemporalSelector
{
    target_VAP_set_id: string
}
interface ValueSelector
{
    target_value_id_type: "id" | "value_string"
    target_value: string
}

export type WComponentSubStateSelector = (ValueSelector & TemporalSelector) | StrictUnion<ValueSelector | TemporalSelector>



// Other potential names: WComponentNodeStateSlice, WComponentNodeStateFocus, WComponentNodeStatePoint
export interface WComponentSubState extends WComponentNodeBase
{
    type: "sub_state"
    target_wcomponent_id: string | undefined
    selector: WComponentSubStateSelector | undefined
}



export function make_valid_selector (selector: Partial<WComponentSubStateSelector> | undefined)
{
    let new_selector: WComponentSubStateSelector | undefined
    if (!selector) return undefined

    const { target_VAP_set_id, target_value, target_value_id_type } = selector

    if (!target_VAP_set_id)
    {
        if (target_value && target_value_id_type)
        {
            new_selector = { target_value, target_value_id_type }
        }
        else new_selector = undefined
    }
    else
    {
        if (target_value && target_value_id_type)
        {
            new_selector = { target_VAP_set_id, target_value, target_value_id_type }
        }
        else new_selector = { target_VAP_set_id }
    }

    return new_selector
}
