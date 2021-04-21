import { test } from "../shared/utils/test"



export function adjust_height (el: HTMLElement | null)
{
    setTimeout(() => {
        if (!el) return
        el.style.height = "auto"
        el.style.height = el.scrollHeight + "px"
    }, 0)
}



const regexp_list_line = /^[ \t]*(\*|\d+\.)/gm
const regexp_text_line = /^[ \t]*[^\s]+/gm
export function add_newlines_to_markdown (text: string): string
{
    const new_lines: string[] = []

    const lines = text.split("\n")
    lines.forEach((line, i) =>
    {
        if (i > 0)
        {
            const previous_line = lines[i - 1]
            if (previous_line.match(regexp_text_line) && !previous_line.match(regexp_list_line))
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



function run_tests ()
{
    console.log("running tests of add_newlines_to_markdown")

    test(add_newlines_to_markdown(`test 1
test2`), `test 1<br>
test2`)

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

    const prepared_text = add_newlines_to_markdown(input_text)
    const expected_text = `Test 1<br>
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
}

// run_tests()
