import { get_calculation_strs_from_text } from "./get_calculation_strs_from_text"
import { get_plain_calculation_object_from_str } from "./get_plain_calculation_object_from_str"
import { get_referenced_values } from "./get_referenced_values"
import { FullCalculationObject, ReplaceCalculationsWithResults } from "../interfaces"
// import { parse_calculation_equations } from "./parse_calculation_equations"



export function replace_calculations_with_results (text: string, args: ReplaceCalculationsWithResults)
{
    const calculation_strs = get_calculation_strs_from_text(text)

    const plain_calculation_objects = calculation_strs.map(get_plain_calculation_object_from_str)

    const calculation_objects = plain_calculation_objects.map(o => get_referenced_values(o, args))

    // const prepared_calculation_objects = parse_calculation_equations(calculation_objects)

    // const computed_calculation_object = perform_calculations(prepared_calculation_objects)

    const calculation_strings_for_presentation = calculation_objects.map(format_calculations_for_presentation)

    calculation_strings_for_presentation.forEach((calculation, i) =>
    {
        const replacer = new RegExp(`\\$\\$\\!.*?\\$\\$\\!`, "s")

        text = text.replace(replacer, calculation)
    })

    text = apply_markdown_tweaks(text)

    return text
}


function format_calculations_for_presentation (o: FullCalculationObject)
{
    return o.valid
        ? o.value_str
        // Format it into code blocks to ensure spacing is correct for YAMLParse error
        : "<code>" + (o.errors.join(", ") || "error") + "</code>"
}


function apply_markdown_tweaks (text: string): string
{
    // When a calculation has an error, we want to show the YAMLParse error to
    // the user.  This needs to have a monospace font to correctly position the
    // "^" character that highlights where in the calculation the offending
    // parse error starts.  To do this we wrap the error in a code block.
    // When two adjacent calculations both have errors, then even though there
    // are newline characters between them, for some reason the newlines are
    // being deleted / ignored by other parts of our code or by markdown-to-jsx
    // The following code makes sure that adjacent "code" blocks have any
    // newlines inbetween them converted into "<br />" which unlike
    // the "\n" newline characters do not seem to get ignored / deleted on
    // rendering from markdown to jsx.
    text = text.replaceAll(/<\/code>(\s*)<code>/gm, (...args) =>
    {
        const number_of_newlines = (args[1] as string).split("").filter(c => c === "\n").length
        const number_of_breaks = Math.max(number_of_newlines, 0)
        if (number_of_newlines)
        {
            return "</code>" + "<br />".repeat(number_of_breaks) + "<code>"
        }
        else return args[0]
    })

    // Ensure code blocks have "correct" space between them, however it is not
    // the same number of spaces because again something strange in the
    // formatting is happening where one or more normal spaces are being ignored
    // so we have to use at least one &nbsp; to force markdown-to-jsx (or some
    // other part of our code fudges) to display a space between two errored
    // calculation blocks
    text = text.replaceAll(/<\/code>( *)<code>/gm, (...args) =>
    {
        const number_of_spaces = args[1].length
        const number_of_nbsp_and_space = Math.ceil(Math.max(number_of_spaces, 0) / 2)
        const spaces = "&nbsp; ".repeat(number_of_nbsp_and_space)
        return "</code>" + spaces + "<code>"
    })

    return text
}
