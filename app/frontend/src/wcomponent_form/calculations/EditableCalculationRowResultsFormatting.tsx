import { EditableNumber } from "../../form/EditableNumber"
import { EditableTextOnBlurType } from "../../form/editable_text/editable_text_common"
import { PlainCalculationObject } from "../../calculations/interfaces"
import { NUMBER_DISPLAY_TYPES, NumberDisplayType } from "../../shared/types"
import { AutocompleteText } from "../../form/Autocomplete/AutocompleteText"
import { AutocompleteOption } from "../../form/Autocomplete/interfaces"
import { format_number_to_string } from "../../shared/format_number_to_string"



interface OwnProps
{
    result: number | undefined
    default_significant_figures: number
    temp_result_sig_figs: number | undefined
    set_temp_result_sig_figs: (v: number | undefined) => void
    result_display_type: NumberDisplayType | undefined
    update_calculation: (calc: Partial<PlainCalculationObject>) => void
}


export function EditableCalculationRowResultsFormatting (props: OwnProps)
{
    const {
        result,
        default_significant_figures,
        temp_result_sig_figs,
        set_temp_result_sig_figs,
        result_display_type,
        update_calculation,
    } = props

    const options = get_number_display_options(result, temp_result_sig_figs ?? default_significant_figures)

    return <div style={{ display: "flex" }}>
        <div
            // Using `<Tooltip title="Significant figures" ...` seems not to work
            data-tooltip="Significant figures" data-tooltip_left_-10 data-tooltip_bottom_-60
        >
            <EditableNumber
                size="small"
                style={{ marginLeft: 5, marginTop: 5, width: "80px" }}
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

        <div
            // Using `<Tooltip title="Display type" ...` seems not to work
            data-tooltip="Display type" data-tooltip_left_0 data-tooltip_bottom_-60
            style={{ marginLeft: "10px", width: "120px" }}
        >
            <div className="description_label">Format</div>
            <AutocompleteText
                selected_option_id={result_display_type}
                options={options}
                retain_options_order={true}
                on_change={id =>
                {
                    const option = options.find(o => o.id === id)
                    const result_display_type: NumberDisplayType | undefined = option?.result_display_type
                    update_calculation({ result_display_type })
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



function get_number_display_options (result: number | undefined, result_sig_figs: number)
{
    result = result ?? 1000.23

    type Option = AutocompleteOption & {order: number, result_display_type: NumberDisplayType}
    const options_by_id: {[k in NumberDisplayType]: Option} = {
        "bare": {
            id: "bare", order: 0,
            result_display_type: "bare",
            // subtitle: "Bare",
            title: format_number_to_string(result, result_sig_figs, NUMBER_DISPLAY_TYPES.bare),
        },
        "simple": {
            id: "simple", order: 1,
            result_display_type: "simple",
            // subtitle: "Simple",
            title: format_number_to_string(result, result_sig_figs, NUMBER_DISPLAY_TYPES.simple),
        },
        "scaled": {
            id: "scaled", order: 2,
            result_display_type: "scaled",
            // subtitle: "Scaled",
            title: format_number_to_string(result, result_sig_figs, NUMBER_DISPLAY_TYPES.scaled),
        },
        "percentage": {
            id: "percentage", order: 4,
            result_display_type: "percentage",
            // subtitle: "percentage",
            title: format_number_to_string(result, result_sig_figs, NUMBER_DISPLAY_TYPES.percentage),
        },
        "abbreviated_scaled": {
            id: "abbreviated_scaled", order: 3,
            result_display_type: "abbreviated_scaled",
            // subtitle: "Scaled abbreviated",
            title: format_number_to_string(result, result_sig_figs, NUMBER_DISPLAY_TYPES.abbreviated_scaled),
        },
        "scientific": {
            id: "scientific", order: 5,
            result_display_type: "scientific",
            // subtitle: "Scientific",
            title: format_number_to_string(result, result_sig_figs, NUMBER_DISPLAY_TYPES.scientific),
        },
    }


    const optional_options_by_id: {[k: string]: Option} = {...options_by_id}

    // Experiment with removing "duplicate" options
    if (options_by_id.abbreviated_scaled.title === options_by_id.scaled.title) delete optional_options_by_id.abbreviated_scaled
    if (options_by_id.scaled.title === options_by_id.simple.title) delete optional_options_by_id.scaled
    if (options_by_id.simple.title === options_by_id.bare.title) delete optional_options_by_id.simple


    const options = Object.values(optional_options_by_id).sort((a, b) =>
    {
        return a.order - b.order
    })

    return options
}
