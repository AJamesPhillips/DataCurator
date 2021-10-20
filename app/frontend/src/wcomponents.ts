// const { v4: uuid_v4 } = require("uuid")

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
    const base_id = 13

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

// const wcomponent_ids = wcomponents.map((wc_str, index) =>
// {
//     const new_id = uuid_v4()
//     const wc = JSON.parse(wc_str)
//     const old_id = wc.id

//     const new_description = (wc.description || "") + `\n\n(Old id: ${old_id})`
//     const new_wc = { ...wc, description: new_description }
//     const new_wc_str = JSON.stringify(new_wc)
//     wcomponents[index] = new_wc_str

//     return { old_id, new_id }
// })
// // we have some old ids like wc1, wc2 etc which are causing problems if used first
// .sort((a, b) => a.old_id.length > b.old_id.length ? -1 : 1)

// if (wcomponent_ids.find(wc => !wc.old_id)) throw new Error(`Found wcomponent with no id`)


// wcomponent_ids.forEach(ids =>
// {
//     const regexp = new RegExp(ids.old_id, "g")

//     wcomponents.forEach((wc_str, index) =>
//     {
//         const new_wc_str = wc_str.replace(regexp, ids.new_id)
//         wcomponents[index] = new_wc_str
//     })
// })

// console.log(JSON.stringify(wcomponent_ids))
// console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n")
// console.log(wcomponents.join(",\n"))
// // console.log(wcomponents.map(wc_str => JSON.parse(wc_str).id).join(",\n"))
// // console.log(wcomponent_ids.map(ids => `${ids.old_id} -> ${ids.new_id}`).join("\n"))

