import { describe, test } from "../../shared/utils/test"
import { remove_rich_text } from "./remove_rich_text"



export const run_remove_rich_text_tests = describe("remove_rich_text", () =>
{
    let text: string
    let result: string
    let expected_result: string

    text = "Something [linked](http://example.com)."
    result = remove_rich_text(text)
    expected_result = "Something linked."
    test(result, expected_result, "Should remove links in middle")

    text = "[Linked](http://example.com) here."
    result = remove_rich_text(text)
    expected_result = "Linked here."
    test(result, expected_result, "Should remove links at start")

    text = "[Linked](http://example.com) here and [here](https://other.example.com)"
    result = remove_rich_text(text)
    expected_result = "Linked here and here"
    test(result, expected_result, "Should remove multiple links at start")

    text = "<auto generated>Text with <auto generated> in it <auto generated>"
    result = remove_rich_text(text)
    expected_result = "Text with in it"
    test(result, expected_result, "Should remove <auto generated> tags")

    text = "Italicised <i>text<i/>"
    result = remove_rich_text(text)
    expected_result = "Italicised text"
    test(result, expected_result, "Should remove tags")

})
