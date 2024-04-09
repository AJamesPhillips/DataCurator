import { h } from "preact"

import { ratio_to_percentage_string } from "../../sharedf/percentages"
import { VAPsType } from "../../wcomponent/interfaces/VAPsType"
import type { StateValueAndPredictionsSet } from "../../wcomponent/interfaces/state"
import { get_VAPs_ordered_by_prob } from "./probable_VAPs"
import { is_string_valid_number } from "../../wcomponent/value/parse_value"
import { WarningTriangle } from "../../sharedf/WarningTriangle"



// This function is called to populate the values of the VAP set summary
// * the `get_wcomponent_state_UI_value` function which populates the value of the component shown under the component title
// * the `convert_VAP_set_to_VAP_visuals` function which gets the values to show in the component node state "table"
export function get_probable_VAP_set_values_for_display (VAP_set: StateValueAndPredictionsSet, VAPs_represent: VAPsType): h.JSX.Element
{
    const VAPs = get_VAPs_ordered_by_prob(VAP_set.entries, VAPs_represent)
    const first_VAP = VAPs[0]
    if (VAPs_represent === VAPsType.boolean && first_VAP) return <>{first_VAP.probability > 0.5 ? "True" : "False"}</>

    const is_number = VAPs_represent === VAPsType.number
    const probable_VAPS = VAPs.filter(({ probability }) => probability > 0)

    return <>
        {probable_VAPS.map((e, i) => <span key={i}>
            {is_number
                ? <InvalidNumberWarning value={e.value}/>
                : e.value
            }
            {i < (probable_VAPS.length - 1) && ", "}
        </span>)}
        {probable_VAPS.length === 0 && "-"}
    </>
}


function InvalidNumberWarning (props: { value: string })
{
    const valid = is_string_valid_number(props.value)
    if (valid) return <>{props.value}</>

    return <span style={{ borderRadius: 5, border: "thin solid #999", padding: "2px 3px 0px 3px" }}>
        <WarningTriangle message="Number is invalid" backgroundColor="white" />
        {props.value}
    </span>
}




export function get_VAP_set_probable_percentages_for_display (VAP_set: StateValueAndPredictionsSet, VAPs_represent: VAPsType)
{
    const VAPs = get_VAPs_ordered_by_prob(VAP_set.entries, VAPs_represent)
    const first_VAP = VAPs[0]
    if (VAPs_represent === VAPsType.boolean && first_VAP) return ratio_to_percentage_string(first_VAP.probability)

    const probable_VAPS = VAPs.filter(({ probability }) => probability > 0)

    return probable_VAPS.map(e => ratio_to_percentage_string(e.probability)).join(", ")
}



export function get_VAP_set_conviction (VAP_set: StateValueAndPredictionsSet, VAPs_represent: VAPsType)
{
    const VAPs = get_VAPs_ordered_by_prob(VAP_set.entries, VAPs_represent)
    const first_VAP = VAPs[0]
    if (VAPs_represent === VAPsType.boolean && first_VAP) return ratio_to_percentage_string(first_VAP.conviction)

    const probable_VAPS = VAPs.filter(({ probability }) => probability > 0)

    const convictions = new Set<number>()
    probable_VAPS.forEach(({ conviction }) => convictions.add(conviction))
    const same_convictions = convictions.size <= 1

    return probable_VAPS.slice(0, same_convictions ? 1 : undefined)
        .map(e => ratio_to_percentage_string(e.conviction)).join(", ")
}
