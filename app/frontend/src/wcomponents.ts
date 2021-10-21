import { get_new_value_and_prediction_set_id } from "./shared/utils/ids"
import type { WComponent } from "./wcomponent/interfaces/SpecialisedObjects"
import type { StateValueAndPredictionsSet, WComponentNodeStateV2 } from "./wcomponent/interfaces/state"
import { parse_wcomponent } from "./wcomponent/parse_json/parse_wcomponent"



export const wcomponents: WComponent[] = [
    // wcomponents objects here...
    // {id: "7abc...8", ...},
    // ... etc
].map(wc =>
{
    const base_id = 14

    const { values_and_prediction_sets } = wc as any as WComponentNodeStateV2
    let vap_sets: StateValueAndPredictionsSet[] | undefined = values_and_prediction_sets && values_and_prediction_sets.map(vap_set =>
    {
        return {
            ...vap_set,
            base_id,
        }
    })

    if (wc.type === "state")
    {
        wc.type = "statev2"

        if (!vap_sets) vap_sets = []
        const state_v1_values: any[] = (wc as any).values || []

        vap_sets = vap_sets.concat(state_v1_values.map((state_v1_value_prediction: V1State) =>
        {
            wc.description += (state_v1_value_prediction.description + `\n\nValue: ${state_v1_value_prediction.value} Converted from state v1: ${JSON.stringify(state_v1_value_prediction)}`)

            const vap_set: StateValueAndPredictionsSet = {
                id: get_new_value_and_prediction_set_id(),
                created_at: state_v1_value_prediction.created_at,
                custom_created_at: state_v1_value_prediction.custom_created_at,
                base_id,
                datetime: {
                    value: state_v1_value_prediction.start_datetime,
                },
                entries: [],
            }

            return vap_set
        }))
    }

    else if (wc.type === "counterfactual")
    {
        wc.type = "counterfactualv2"
        wc.description += `\n\nTODO: Convert from counterfactual v1: ${JSON.stringify(wc)}`
    }

    const ok_wc = parse_wcomponent({
        ...wc,
        base_id,
        // type: "causal_link",
        // from_id: "",
        // to_id: "",
        // from_type: "meta",
        // to_type: "meta",
        // created_at: new Date(),
        // custom_created_at: undefined,
        values_and_prediction_sets: vap_sets,
    } as any)

    return ok_wc
})

interface V1State
{
    id: string
    created_at: Date
    custom_created_at?: Date | undefined
    base_id?: number
    start_datetime: Date | undefined
    description: string
    value: string
}
