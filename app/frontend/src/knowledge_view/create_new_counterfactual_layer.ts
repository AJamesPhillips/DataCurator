import type { CounterfactualLayer } from "../shared/models/interfaces/counterfactual"
import { get_new_counterfactual_layer_id } from "../utils/utils"



export function create_new_counterfactual_layer (args: Partial<CounterfactualLayer> = {})
{
    const knowledge_view: CounterfactualLayer = {
        id: get_new_counterfactual_layer_id(),
        created_at: new Date(),
        title: "",
        description: "",
        ...args,
    }

    return knowledge_view
}
