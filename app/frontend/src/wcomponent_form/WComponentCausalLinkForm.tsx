import { WComponent, WComponentCausalConnection, WComponentsById, wcomponent_is_statev2 } from "../wcomponent/interfaces/SpecialisedObjects"
import { EditableTextOnBlurType } from "../form/editable_text/editable_text_common"
import { EditableTextSingleLine } from "../form/editable_text/EditableTextSingleLine"
import { perform_calculations } from "../calculations/perform_calculations"
import { PlainCalculationObject } from "../calculations/interfaces"
import { Button } from "../sharedf/Button"



interface OwnProps
{
    wcomponent: WComponentCausalConnection
    from_wcomponent: WComponent | undefined
    editing: boolean
    wcomponents_by_id: WComponentsById
    upsert_wcomponent: (partial_wcomponent: Partial<WComponentCausalConnection>) => void
}



export function WComponentCausalLinkForm (props: OwnProps)
{
    const { wcomponent } = props

    // const from_statev2 = wcomponent_is_statev2(from_wcomponent)

    return <BasicCausalLinkForm
        effect_string={wcomponent.effect_string}
        effect_when_true={wcomponent.effect_when_true}
        effect_when_false={wcomponent.effect_when_false}
        editing={props.editing}
        wcomponents_by_id={props.wcomponents_by_id}
        upsert_wcomponent={props.upsert_wcomponent}
    />
}



interface BasicCausalLinkFormProps
{
    effect_string: string | undefined
    // TODO: deprecate number from this.  It used to be number | undefined but
    // because we want to capture simulation.js/InsightMaker Flow "effects" then
    // we need to move to string | undefined
    effect_when_true: number | undefined
    effect_when_false: number | undefined
    editing: boolean
    wcomponents_by_id: WComponentsById
    upsert_wcomponent: (partial_wcomponent: Partial<WComponentCausalConnection> & { type?: undefined }) => void
}



export function BasicCausalLinkForm (props: BasicCausalLinkFormProps)
{
    const {
        effect_string,
        effect_when_true,
        effect_when_false,
        editing,
        wcomponents_by_id,
        upsert_wcomponent,
    } = props

    const display_effect_string = editing || effect_string !== undefined
    const display_effect_when_true = effect_when_true !== undefined
    const display_effect_when_false = effect_when_false !== undefined

    return <p style={{ display: "flex", flexDirection: "column" }} >
        {display_effect_string && <div>
            <span className="description_label">Effect</span> &nbsp;
            <EditableTextSingleLine
                placeholder=""
                value={effect_string || ""}
                editing_allowed={editing}
                on_blur={effect_string =>
                {
                    const calculations: PlainCalculationObject[] = [
                        {
                            id: -1,
                            name: "",
                            value: effect_string,
                        }
                    ]
                    const calculation_results = perform_calculations(calculations, wcomponents_by_id)
                    const calculation_result = calculation_results[0]
                    const effect = calculation_result?.value

                    upsert_wcomponent({
                        effect_string: effect_string || undefined,
                        effect_when_true: effect,
                    })
                }}
                on_blur_type={EditableTextOnBlurType.conditional}
            />
        </div>}
        {display_effect_when_true && <div>
            <span className="description_label">Effect value</span> &nbsp;
            <span>{effect_when_true}</span>
            {/* <EditableTextSingleLine
                placeholder=""
                value={effect_when_true}
                editing_allowed={false}
                style={{ maxWidth: "200px" }}
                // on_blur={effect_when_true => upsert_wcomponent({ effect_when_true })}
                // on_blur_type={EditableTextOnBlurType.conditional}
            /> */}
        </div>}
        {display_effect_when_false && <div>
            <span className="description_label">Effect value when false</span> &nbsp;
            <span>{effect_when_false}</span>
                {/* &nbsp; <EditableTextSingleLine
                placeholder=""
                value={effect_when_false}
                editing_allowed={false}
                style={{ maxWidth: "200px" }}
                // on_blur={effect_when_false => upsert_wcomponent({ effect_when_false })}
                // on_blur_type={EditableTextOnBlurType.conditional}
            /> */}
            {editing && <>
                &nbsp;
                <span
                    className="description_label"
                    style={{ cursor: "pointer", color: "#F99" }}
                    onClick={() => upsert_wcomponent({ effect_when_false: undefined })}
                >
                    Field deprecated (click to remove)
                </span>
            </>}
        </div>}

        {/* flexGrow does not seem to work
        {editing && display_effect_when_false && <div style={{ flex: 1, margin: "auto" }}>
            <Button
                value="Invert Effect"
                onClick={() =>
                {
                    upsert_wcomponent({
                        effect_when_true: effect_when_false,
                        effect_when_false: effect_when_true,
                    })
                }}
            />
        </div>} */}
    </p>
}
