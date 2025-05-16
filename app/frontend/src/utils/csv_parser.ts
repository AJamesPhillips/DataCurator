import { describe, test } from "datacurator-core/utils/test"


const regexp_unquoted = /(?:^)([^",\n\r]*),?/g
const regexp_quoted = /(?:^)"([^"]+|"")*",?/g
const regexp_new_line = /(?:^)([\n\r]+)/g

export function csv_to_array (str_data: string)
{
    const data: string[][] = []

    let match_unquoted: RegExpMatchArray | null
    let match_quoted: RegExpMatchArray | null
    let match_new_line: RegExpMatchArray | null
    let sub_str: string
    let new_line: string[] = []
    let trailing_comma = false
    let needs_new_line = true
    let exit_in = 2

    do {

        trailing_comma = false

        if (needs_new_line)
        {
            needs_new_line = false
            exit_in = 2
            new_line = []
            data.push(new_line)
        }

        match_unquoted = str_data.match(regexp_unquoted)
        match_quoted = str_data.match(regexp_quoted)
        if (match_quoted && match_quoted.length)
        {
            sub_str = match_quoted![0]!
            trailing_comma = sub_str.endsWith(",")
            const str_to_add = (trailing_comma ? sub_str.slice(1, -2) : sub_str.slice(1, -1)).replace(/""/g, `"`)
            new_line.push(str_to_add)
            str_data = str_data.slice(sub_str.length)
            if (!trailing_comma) exit_in -= 1
        }
        else if (match_unquoted!.length)
        {
            sub_str = match_unquoted![0]!
            trailing_comma = sub_str.endsWith(",")
            const str_to_add = trailing_comma ? sub_str.slice(0, -1) : sub_str
            new_line.push(str_to_add)
            str_data = str_data.slice(sub_str.length)
            if (!trailing_comma) exit_in -= 1
        }

        match_new_line = str_data.match(regexp_new_line)
        if (!trailing_comma && match_new_line && match_new_line.length)
        {
            needs_new_line = true
            exit_in = 2
            str_data = str_data.slice(match_new_line[0]!.length)
        }

        if (str_data === "") exit_in -= 1

    } while (exit_in > 0)

    // Return the parsed data.
    return data
}


export const test_csv_to_array = describe.delay("csv_to_array", () =>
{
    test(csv_to_array(``), [[``]])
    test(csv_to_array(`,`), [[``, ``]])
    test(csv_to_array(`a`), [[`a`]])
    test(csv_to_array(`a,`), [[`a`, ``]])
    test(csv_to_array(`,a`), [[``, `a`]])
    test(csv_to_array(`,a,`), [[``, `a`, ``]])
    test(csv_to_array(`a,a`), [[`a`, `a`]])
    test(csv_to_array(`a,a,`), [[`a`, `a`, ``]])
    test(csv_to_array(`,a,a`), [[``, `a`, `a`]])
    test(csv_to_array(`,a,a,`), [[``, `a`, `a`, ``]])
    test(csv_to_array(`\n`), [[``], [``]])
    test(csv_to_array(`a\na`), [[`a`], [`a`]])
    test(csv_to_array(`,\n,`), [[``, ``], [``, ``]])
    test(csv_to_array(`a,\na,`), [[`a`, ``], [`a`, ``]])
    test(csv_to_array(`,a\n,a`), [[``, `a`], [``, `a`]])
    test(csv_to_array(`,a,\n,a,`), [[``, `a`, ``], [``, `a`, ``]])
    test(csv_to_array(`""`), [[``]])
    test(csv_to_array(`"",`), [[``, ``]])
    test(csv_to_array(`,""`), [[``, ``]])
    test(csv_to_array(`,"",`), [[``, ``, ``]])
    test(csv_to_array(`","`), [[`,`]])
    test(csv_to_array(`",",`), [[`,`, ``]])
    test(csv_to_array(`,","`), [[``, `,`]])
    test(csv_to_array(`,",",`), [[``, `,`, ``]])
    test(csv_to_array(`"",""`), [[``, ``]])
    test(csv_to_array(`"a"`), [[`a`]])
    test(csv_to_array(`"a",`), [[`a`, ``]])
    test(csv_to_array(`,"a"`), [[``, `a`]])
    test(csv_to_array(`,"a",`), [[``, `a`, ``]])
    test(csv_to_array(`"a","a"`), [[`a`, `a`]])
    test(csv_to_array(`"a","a",`), [[`a`, `a`, ``]])
    test(csv_to_array(`,"a","a"`), [[``, `a`, `a`]])
    test(csv_to_array(`,"a","a",`), [[``, `a`, `a`, ``]])
    test(csv_to_array(`""""`), [[`"`]])
    test(csv_to_array(`"""",`), [[`"`, ``]])
    test(csv_to_array(`,""""`), [[``, `"`]])
    test(csv_to_array(`,"""",`), [[``, `"`, ``]])
    test(csv_to_array(`"""a"""`), [[`"a"`]])
    test(csv_to_array(`"""a""","""a"""`), [[`"a"`, `"a"`]])
    test(csv_to_array(`""""""`), [[`""`]])
    test(csv_to_array(`"a""a"`), [[`a"a`]])
    test(csv_to_array(`"a"",""a"`), [[`a","a`]])
    test(csv_to_array(`""\n`), [[``], [``]])

})
