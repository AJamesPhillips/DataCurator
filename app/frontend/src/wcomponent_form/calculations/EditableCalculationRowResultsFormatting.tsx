import { EditableNumber } from "../../form/EditableNumber"
import { EditableTextOnBlurType } from "../../form/editable_text/editable_text_common"
import { PlainCalculationObject } from "../../calculations/interfaces"



interface OwnProps
{
    default_significant_figures: number
    temp_result_sig_figs: number | undefined
    set_temp_result_sig_figs: (v: number | undefined) => void
    update_calculation: (calc: Partial<PlainCalculationObject>) => void
}


export function EditableCalculationRowResultsFormatting (props: OwnProps)
{
    const {
        default_significant_figures,
        temp_result_sig_figs,
        set_temp_result_sig_figs,
        update_calculation,
    } = props

    return <div>
        <div
            data-tooltip="Significant figures" data-tooltip_left_-10 data-tooltip_bottom_-60
        >
            <EditableNumber
                size="small"
                style={{ marginLeft: 5, width: "80px" }}
                placeholder="Sig. figs"
                value={temp_result_sig_figs}
                allow_undefined={true}
                conditional_on_change={new_temp_result_sig_figs =>
                {
                    new_temp_result_sig_figs = sanitise_significant_figures_value(new_temp_result_sig_figs)
                    set_temp_result_sig_figs(new_temp_result_sig_figs)
                }}
                on_blur_type={EditableTextOnBlurType.always}
                on_blur={result_sig_figs =>
                {
                    result_sig_figs = sanitise_significant_figures_value(result_sig_figs)
                    const new_temp_result_sig_figs = result_sig_figs ?? default_significant_figures
                    set_temp_result_sig_figs(new_temp_result_sig_figs)
                    update_calculation({ result_sig_figs })
                }}
            />
        </div>
    </div>
}



function sanitise_significant_figures_value (value: number | undefined): number | undefined
{
    if (value === undefined) return undefined

    return Math.max(Math.round(value), 0)
}
