import { get_calculation_strs_from_text } from "./get_calculation_strs_from_text"
import { get_plain_calculation_object_from_str } from "./get_plain_calculation_object_from_str"
import { get_referenced_values } from "./get_referenced_values"
import { ReplaceCalculationsWithResults } from "./interfaces"



export function replace_calculations_with_results (text: string, args: ReplaceCalculationsWithResults)
{
    const calculation_strs = get_calculation_strs_from_text(text)

    const plain_calculation_objects = calculation_strs.map(get_plain_calculation_object_from_str)

    const calculation_object = plain_calculation_objects.map(o => get_referenced_values(o, args))

    const calculations = calculation_object.map(o => (o.valid
        ? o.value_str
        // Format it into code blocks to ensure spacing is correct for YAMLParse error
        : "<code>" + (o.errors.join(", ") || "error") + "</code>"))

    calculations.forEach((calculation, i) =>
    {
        const replacer = new RegExp(`\\$\\$\\!.*?\\$\\$\\!`, "s")

        text = text.replace(replacer, calculation)
    })

    return text
}
