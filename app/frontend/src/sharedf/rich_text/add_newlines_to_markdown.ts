import { describe, test } from "../../shared/utils/test"



const regexp_code_block = /^(([ ]{0,3}```)|([ ]{4,})).*/gm
const regexp_list_line = /^[ \t]*(\*|\d+\.)/gm
const regexp_text_line = /^[ \t]*[^\s]+/gm
export function add_newlines_to_markdown (text: string): string
{
    const new_lines: string[] = []
    let in_code_block = false

    const lines = text.split("\n")
    lines.forEach((line, i) =>
    {
        if (i > 0)
        {
            const previous_line = lines[i - 1]!
            const is_code_block = previous_line.match(regexp_code_block)
            if (is_code_block) in_code_block = !in_code_block

            if (in_code_block)
            {
                // Do nothing special for text or list lines
            }
            else if (previous_line.match(regexp_text_line) && !previous_line.match(regexp_list_line))
            {
                if (line.match(regexp_list_line))
                {
                    new_lines[i - 1] = previous_line + "\n"
                }
                else if (line.match(regexp_text_line))
                {
                    new_lines[i - 1] = previous_line + "<br>"
                }
            }
        }

        new_lines.push(line)
    })

    const new_text = new_lines.join("\n")

    return new_text
}



export function run_add_newlines_to_markdown_tests ()
{
    console. log("running tests of add_newlines_to_markdown")

    test(add_newlines_to_markdown(`
test 1
test2
`), `
test 1<br>
test2
`)

    const bulleted_items = `* Test bullet 1
* Test bullet 2`
    test(add_newlines_to_markdown(bulleted_items), bulleted_items)



    const input_text = `Test 1
Test
  Test 3${"  "}
\tTest 4
* Test bullet 1
* Test bullet 2

Test 5
1. Test number 1
2. Test number 2

`

    let prepared_text = add_newlines_to_markdown(input_text)
    let expected_text = `Test 1<br>
Test<br>
  Test 3  <br>
\tTest 4\n
* Test bullet 1
* Test bullet 2

Test 5\n
1. Test number 1
2. Test number 2

`

    test(prepared_text, expected_text)

    describe("Code blocks should not contain <br>", () =>
    {

        prepared_text = add_newlines_to_markdown(`
\`\`\`
some text
\`\`\`
`)
            expected_text = `
\`\`\`
some text
\`\`\`
`
            test(prepared_text, expected_text, "Three \`\`\` should stop <br> insertion")


            // And test code blocks with up to three prepended spaces
            prepared_text = add_newlines_to_markdown(`
   \`\`\`
some text
\`\`\`
`)
            expected_text = `
   \`\`\`
some text
\`\`\`
`
            test(prepared_text, expected_text, "Three \`\`\` with three prepended spaces should stop <br> insertion")


            // And test normal text with up to three prepended spaces
            prepared_text = add_newlines_to_markdown(`
   more text
   some more text
`)
            expected_text = `
   more text<br>
   some more text
`
            test(prepared_text, expected_text, "Three prepended spaces for normal text should allow <br> insertion")


            // And test code blocks with up to four prepended spaces which then get
            // rendered by Markdown-to-JSX as a code block containing the "```", i.e.
            // the "```" is not removed by Markdown-to-JSX because
            // the "    " (four spaces) are treated as triggering a code block
            prepared_text = add_newlines_to_markdown(`
    \`\`\`some text
    some more text
`)
            expected_text = `
    \`\`\`some text
    some more text
`
            test(prepared_text, expected_text, "Four prepended spaces for \`\`\` and normal text should stop <br> insertion")
    })
}
