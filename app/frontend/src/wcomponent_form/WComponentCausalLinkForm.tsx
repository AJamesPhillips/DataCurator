import { h } from "preact"

import { EditableNumber } from "../form/EditableNumber"
import { VAPsType } from "../wcomponent/interfaces/VAPsType"
import { WComponent, WComponentCausalConnection, wcomponent_is_statev2 } from "../wcomponent/interfaces/SpecialisedObjects"
import { get_wcomponent_VAPs_represent } from "../wcomponent/get_wcomponent_VAPs_represent"
import { Button } from "../sharedf/Button"



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

    const show_effect_when_false = !VAPs_represent_number && editing
        ? (from_wcomponent === undefined || from_statev2)
        : from_statev2 && wcomponent.effect_when_false !== undefined


    return <BasicCausalLinkForm
        show_primary_effect={show_primary_effect}
        show_effect_when_false={show_effect_when_false}
        VAPs_represent_number={VAPs_represent_number}
        effect_when_true={wcomponent.effect_when_true}
        effect_when_false={wcomponent.effect_when_false}
        editing={editing}
        change_effect={upsert_wcomponent}
    />
}



interface BasicCausalLinkFormProps
{
    show_primary_effect: boolean
    show_effect_when_false: boolean
    VAPs_represent_number: boolean
    effect_when_true: number | undefined
    effect_when_false: number | undefined
    editing: boolean
    change_effect: (arg: { effect_when_true: number | undefined, effect_when_false: number | undefined }) => void
}



export function BasicCausalLinkForm (props: BasicCausalLinkFormProps)
{
    const {
        show_primary_effect,
        show_effect_when_false,
        VAPs_represent_number,
        effect_when_true,
        effect_when_false,
        editing,
        change_effect,
    } = props


    const primary_effect_description = VAPs_represent_number ? "Effect" : "Effect when true"

    return <p style={{ display: "flex", flex: "1" }} >
        {show_primary_effect && <div>
            <span className="description_label">{primary_effect_description}</span> &nbsp; <EditableNumber
                placeholder="..."
                value={effect_when_true}
                allow_undefined={true}
                // Remember to also send unchanged effect_when_false
                conditional_on_blur={effect_when_true => change_effect({ effect_when_true, effect_when_false })}
            />
        </div>}

        {show_effect_when_false && <div>
            <span className="description_label">Effect when false</span> &nbsp; <EditableNumber
                placeholder="..."
                value={effect_when_false}
                allow_undefined={true}
                // Remember to also send unchanged effect_when_true
                conditional_on_blur={effect_when_false => change_effect({ effect_when_false, effect_when_true })}
            />
        </div>}

        {/* flexGrow does not seem to work */}
        {show_effect_when_false && <div style={{ flexGrow: 2, margin: "auto" }}>
            <Button
                value="Invert"
                disabled={!editing}
                onClick={() =>
                {
                    change_effect({
                        effect_when_true: effect_when_false,
                        effect_when_false: effect_when_true,
                    })
                }}
            />
        </div>}
    </p>
}
