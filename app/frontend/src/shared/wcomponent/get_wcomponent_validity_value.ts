import { WComponent, wcomponent_has_validity_predictions } from "./interfaces/SpecialisedObjects"
import type { CurrentValue } from "./interfaces/generic_value"
import { get_created_at_ms } from "./utils_datetime"



export interface CurrentValidityValue extends CurrentValue
{
    is_defined: boolean,
    value: boolean
}


const default_value = (): CurrentValidityValue => ({
    possibilities: [],
    is_defined: false,
    value: true,
    probability: 1,
    conviction: 1,
    uncertain: false,
    assumed: false,
})


interface GetWcomponentStateValueArgs
{
    wcomponent: WComponent
    created_at_ms: number
    sim_ms: number
}
export function get_wcomponent_validity_value (args: GetWcomponentStateValueArgs): CurrentValidityValue
{
    const { wcomponent, created_at_ms, sim_ms } = args

    if (!wcomponent_has_validity_predictions(wcomponent)) return default_value()

    // TODO upgrade validities from simple predictions to VAP_sets
    // get_VAP_set_value({
    //     values_and_prediction_sets: wcomponent.validity,
    //     VAPs_represents_boolean,
    //     wc_counterfactuals,
    //     created_at_ms,
    //     sim_ms,
    //     boolean_true_str,
    //     boolean_false_str,
    // })

    // .values are sorted created_at ascending
    const active_validity = wcomponent.validity.find_last(v => get_created_at_ms(v) <= created_at_ms)

    if (!active_validity) return default_value()

    const { probability, conviction } = active_validity
    const valid = probability > 0.5
    const uncertain = (probability > 0 && probability < 1) || conviction !== 1

    return { is_defined: true, value: valid, uncertain, probability, conviction, assumed: false, possibilities: [] }
}
