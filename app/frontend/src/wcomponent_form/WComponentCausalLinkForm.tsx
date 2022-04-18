import { h } from "preact"

import { EditableNumber } from "../form/EditableNumber"
import { VAPsType } from "../wcomponent/interfaces/VAPsType"
import { WComponent, WComponentCausalConnection, wcomponent_is_statev2 } from "../wcomponent/interfaces/SpecialisedObjects"
import { get_wcomponent_VAPs_represent } from "../wcomponent/get_wcomponent_VAPs_represent"
import { Button } from "../sharedf/Button"
import { EditableTextOnBlurType } from "../form/editable_text/editable_text_common"



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
    // Using an empty wcomponents_by_id for now as making causal connections from state_value should not be
    // supported (for now) and I want to think more about this use case before implementing it
    const wcomponents_by_id = {}
    const VAPs_represent_number = get_wcomponent_VAPs_represent(from_wcomponent, wcomponents_by_id) === VAPsType.number


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

    return <p style={{ display: "flex" }} >
        {show_primary_effect && <div style={{ flex: 1 }}>
            <span className="description_label">{primary_effect_description}</span> &nbsp; <EditableNumber
                placeholder="..."
                value={effect_when_true}
                allow_undefined={true}
                style={{ width: "100px" }}
                // Remember to also send unchanged effect_when_false
                on_blur={effect_when_true => change_effect({ effect_when_true, effect_when_false })}
                on_blur_type={EditableTextOnBlurType.conditional}
            />
        </div>}

        {show_effect_when_false && <div style={{ flex: 1 }}>
            <span className="description_label">Effect when false</span> &nbsp; <EditableNumber
                placeholder="..."
                value={effect_when_false}
                allow_undefined={true}
                style={{ width: "100px" }}
                // Remember to also send unchanged effect_when_true
                on_blur={effect_when_false => change_effect({ effect_when_false, effect_when_true })}
                on_blur_type={EditableTextOnBlurType.conditional}
            />
        </div>}

        {/* flexGrow does not seem to work */}
        {editing && show_effect_when_false && <div style={{ flex: 1, margin: "auto" }}>
            <Button
                value="Invert Effect"
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
