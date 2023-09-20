import { get_wcomponent_state_UI_value } from "../../wcomponent_derived/get_wcomponent_state_UI_value"
import { ReplaceNormalIdsInTextArgs } from "../../sharedf/rich_text/interfaces"
import { replace_normal_ids } from "../../sharedf/rich_text/replace_normal_ids"
import { FullCalculationObject, PlainCalculationObject, ReplaceCalculationsWithResults } from "./interfaces"



export function get_referenced_values (calculation: PlainCalculationObject, args: ReplaceCalculationsWithResults): FullCalculationObject
{
    if (!calculation.valid) return calculation

    let value: number
    let value_str = ""

    if (typeof calculation.name === "string")
    {
        value_str = `${calculation.name} = `
    }


    if (typeof calculation.value === "number")
    {
        value = calculation.value
        value_str += value.toString()
    }
    else// if (typeof calculation.value === "string")
    {
        const args2: ReplaceNormalIdsInTextArgs = {
            wcomponents_by_id: args.wcomponents_by_id,
            depth_limit: 1,
            render_links: true,
            root_url: "",
            get_title: wc =>
            {
                const UI_value = get_wcomponent_state_UI_value({
                    wcomponent: wc,
                    VAP_set_id_to_counterfactual_v2_map: undefined,
                    created_at_ms: args.created_at_ms,
                    sim_ms: args.sim_ms,
                })

                return UI_value.values_string + " " + args.get_title(wc)
            },
        }

        value = Number.NaN
        // value = get_wcomponent_state_value_and_probabilities({
        //     wcomponent: wc
        //     VAP_set_id_to_counterfactual_v2_map: VAPSetIdToCounterfactualV2Map | undefined
        //     created_at_ms: number
        //     sim_ms: number
        // })
        value_str += replace_normal_ids(calculation.value, 0, args2)
    }


    return {
        valid: true,
        name: calculation.name || "",
        value,
        value_str,
    }
}
