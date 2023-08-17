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

    // Ensure calculation code blocks (because they've errored) have a break
    // between them if there's a newline between
    // them.  For some reason the newlines are being deleted / ignored by other
    // parts of our code or by markdown-to-jsx
    text = text.replaceAll(/<\/code>(\s*)<code>/gm, (...args) =>
    {
        const number_of_newlines = (args[1] as string).split("").filter(c => c === "\n").length
        const number_of_breaks = Math.max(number_of_newlines, 0)
        if (number_of_newlines)
        {
            return "</code>" + "<br />".repeat(number_of_breaks) + " <code>"
        }
        else return args[0]
    })

    // // Ensure code blocks have correct space between them
    // text = text.replaceAll(/<\/code>( *)<code>/gm, (...args) =>
    // {
    //     const number_of_spaces = args[1].length
    //     const number_of_nbsp_and_space = Math.ceil(Math.max(number_of_spaces, 1) / 2)
    //     return "</code>" + "&nbsp; ".repeat(number_of_nbsp_and_space) + " <code>"
    // })

    return text
}
