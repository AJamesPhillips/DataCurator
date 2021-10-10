import type { WComponentType } from "./interfaces/wcomponent_base"



export function wcomponent_type_to_text (type: WComponentType)
{
    if (type === "counterfactualv2") return "counterfactual"
    if (type === "statev2") return "state"
    return type.replaceAll("_", " ")
}
