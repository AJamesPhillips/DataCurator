import { h } from "preact"

import { EditableNumber } from "../../form/EditableNumber"
import { VAPsType } from "../../wcomponent/interfaces/value_probabilities_etc"
import { WComponent, WComponentCausalConnection, wcomponent_is_statev2 } from "../../wcomponent/interfaces/SpecialisedObjects"
import { get_wcomponent_VAPs_represent } from "../../wcomponent/value_and_prediction/utils"



interface OwnProps
{
    wcomponent: WComponentCausalConnection
    from_wcomponent: WComponent | undefined
    editing: boolean
    upsert_wcomponent: (partial_wcomponent: Partial<WComponentCausalConnection>) => void
}



export function WComponentCausalLinkForm (props: OwnProps)
{
    const {
        wcomponent,
        from_wcomponent,
        editing,
        upsert_wcomponent,
    } = props


    const from_statev2 = wcomponent_is_statev2(from_wcomponent)
    const VAPs_represent_number = get_wcomponent_VAPs_represent(from_wcomponent) === VAPsType.number


    const show_primary_effect = editing || wcomponent.effect_when_true !== undefined
    const primary_effect_description = VAPs_represent_number ? "Effect" : "Effect when true"

    const show_effect_when_false = !VAPs_represent_number && editing
        ? (from_wcomponent === undefined || from_statev2)
        : from_statev2 && wcomponent.effect_when_false !== undefined


    return <div>
        {show_primary_effect && <p>
            <span className="description_label">{primary_effect_description}</span> &nbsp; <EditableNumber
                placeholder="..."
                value={wcomponent.effect_when_true}
                allow_undefined={true}
                conditional_on_blur={effect_when_true => upsert_wcomponent({ effect_when_true })}
            />
        </p>}

        {show_effect_when_false && <p>
            <span className="description_label">Effect when false</span> &nbsp; <EditableNumber
                placeholder="..."
                value={wcomponent.effect_when_false}
                allow_undefined={true}
                conditional_on_blur={effect_when_false => upsert_wcomponent({ effect_when_false })}
            />
        </p>}
    </div>
}
