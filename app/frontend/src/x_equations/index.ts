import { CharStreams, CommonTokenStream } from "antlr4ts"
import { AbstractParseTreeVisitor, TerminalNode } from "antlr4ts/tree"

import { test } from "../shared/utils/test"
import { datacurator_grammarLexer } from "./datacurator_grammarLexer"
import {
    AdditionOrSubtractionContext,
    datacurator_grammarParser,
    EquationContext,
    ExpressionContext,
    FunctionsWith2ArgsContext,
    FunctionsWithArgsContext,
    ConstantsContext,
    IDRefContext,
    MultiplicationOrDivisionContext,
    NumberContext,
    ParenthesesContext,
    PowerContext,
    SubexpressionContext,
} from "./datacurator_grammarParser"
import type { datacurator_grammarVisitor } from "./datacurator_grammarVisitor"



export function go_antlr ()
{
    // run_tests()
}



function equation_to_javascript (equation_string: string, compact_js = true): string
{
    const parser = parse_equation(equation_string)
    return parser_to_javascript(parser, compact_js)
}



function parse_equation (equation_string: string)
{
    const input_stream = CharStreams.fromString(equation_string)
    const lexer = new datacurator_grammarLexer(input_stream)
    const token_stream = new CommonTokenStream(lexer)
    const parser = new datacurator_grammarParser(token_stream)

    return parser
}



class JavaScriptVisitor extends AbstractParseTreeVisitor<string> implements datacurator_grammarVisitor<string>
{
    #compact_js = true
    #indent = "    "
    #new_line = "\n"
    // #operator_stack: Operator[] = []

    constructor (compact_js = true)
    {
        super()

        this.#compact_js = compact_js
        if (compact_js)
        {
            this.#indent = ""
            this.#new_line = ""
        }
    }


    protected defaultResult(): string
    {
        return ""
    }

    protected aggregateResult (aggregate: string, next_result: string)
    {
        return aggregate + next_result
    }


    visitEquation (ctx: EquationContext): string
    {
        const child_result = this.visitChildren(ctx)
        const needs_args = child_result.includes("args")
        const args_string = needs_args ? "args" : ""

        return `function (${args_string})` + this.#new_line
            + `{` + this.#new_line
            + this.#indent + "return " + (child_result || "undefined") + this.#new_line
            + `}`
    }


    visitExpression (ctx: ExpressionContext): string
    {
        return this.visitChildren(ctx)
    }


    visitSubexpression (ctx: SubexpressionContext): string
    {
        return this.visitChildren(ctx)
    }


    visitNumber (ctx: NumberContext): string
    {
        return ctx.text
    }


    visitIDRef (ctx: IDRefContext): string
    {
        return this.process_id_ref(ctx.text)
    }

    process_id_ref (text: string): string
    {
        const id = text.replace("@@", "")
        return `args["${id}"]`
    }


    // TODO understand why the "rest" part of AdditionOrSubtraction goes into
    // terminal rather than number or IDRef
    visitTerminal (ctx: TerminalNode): string
    {
        if (ctx.text.includes("@@")) return this.process_id_ref(ctx.text)

        return ctx.text === "<EOF>" ? "" : ctx.text
    }


    visitParentheses (ctx: ParenthesesContext): string
    {
        return `(${this.visit(ctx._inner)})`
    }


    #args2_function_name_pattern_map: {[funktion_name: string]: string} = {
        log: "(Math.log10(<ARG1>)/Math.log10(<ARG2>))",
    }

    visitFunctionsWith2Args (ctx: FunctionsWith2ArgsContext): string
    {
        const function_pattern = this.#args2_function_name_pattern_map[ctx._arg_funktion.text || ""]

        if (!function_pattern) return ""

        const arg1 = this.visit(ctx._arg1)
        const arg2 = this.visit(ctx._arg2)

        return function_pattern.replace("<ARG1>", arg1).replace("<ARG2>", arg2)
    }


    #args1_function_name_map: {[funktion_name: string]: string} = {
        sin: "sin",
        cos: "cos",
        tan: "tan",
        arcsin: "asin",
        arccos: "acos",
        arctan: "atan",
        log10: "log10",
        ln: "log",
    }

    visitFunctionsWithArgs (ctx: FunctionsWithArgsContext): string
    {
        const function_name = this.#args1_function_name_map[ctx._arg_funktion.text || ""]

        if (!function_name) return ""

        const arg1 = this.visit(ctx._arg1)

        return `Math.${function_name}(${arg1})`
    }


    visitConstants (ctx: ConstantsContext): string
    {
        if (ctx.text === "PI") return "Math.PI"
        else if (ctx.text === "E") return "Math.E"

        return ""
    }


    visitPower (ctx: PowerContext): string
    {
        return this.#compact_js
            ? `Math.pow(${this.visit(ctx._left)},${this.visit(ctx._right)})`
            : `Math.pow(${this.visit(ctx._left)}, ${this.visit(ctx._right)})`
    }


    visitMultiplicationOrDivision (ctx: MultiplicationOrDivisionContext): string
    {
        return this.process_arithmetic(ctx)
    }


    visitAdditionOrSubtraction (ctx: AdditionOrSubtractionContext): string
    {
        return this.process_arithmetic(ctx)
    }


    process_arithmetic (ctx: MultiplicationOrDivisionContext | AdditionOrSubtractionContext): string
    {
        const left = this.visit(ctx._left)

        let rest = ""
        ctx._rest_operators.forEach((operator, index) =>
        {
            const rest_right = this.visit(ctx._rest[index]!)
            rest += (this.#compact_js
                ? `${operator.text} ${rest_right}`
                : `${operator.text} ${rest_right} `
            )
        })

        return this.#compact_js
            ? `(${left}${rest})`
            : `( ${left} ${rest})`
    }
}



function parser_to_javascript (parser: datacurator_grammarParser, compact_js: boolean): string
{
    const parse_tree_result = parser.equation()
    const visitor = new JavaScriptVisitor(compact_js)
    const result = visitor.visit(parse_tree_result)
    return result
}



const compact_test_javascript = true
function run_tests ()
{
    // Specs contain: [test_name, input, expected_result, expect_error]
    const specs: [string, string, string, boolean?][] = [
        ["Empty equation", "", "function (){return undefined}"],
        ["Errors on <EOF>", "<EOF>", "", true],
        ["Only whitespace", " \t\r\n", "function (){return undefined}"],
        ["Single number", "1", "function (){return 1}"],
        ["Adding two numbers", "-1 + 4", "function (){return (-1+ 4)}"],
        ["Subtracting two numbers", "-1 - -4", "function (){return (-1- -4)}"],
        ["Multiplying two numbers", "-1 * -4", "function (){return (-1* -4)}"],
        ["Dividing two numbers", "-1 / -4", "function (){return (-1/ -4)}"],
        ["Power", "-1 ^ -4", "function (){return Math.pow(-1,-4)}"],
        // ["Power", "-1 ** -4", "function (){return Math.pow(-1, -4)}"],

        ["Adding three numbers", "-1 + 4 + 2", "function (){return (-1+ 4+ 2)}"],
        ["Adding and subtracting four numbers", "-1 + 4 - -2 + 3", "function (){return (-1+ 4- -2+ 3)}"],

        ["References", "@@00000000-0000-4000-b000-000000000000", `function (args){return args["00000000-0000-4000-b000-000000000000"]}`],
        ["Adding references", "@@00000000-0000-4000-b000-000000000000 + @@11111111-1111-4111-b111-111111111111", `function (args){return (args["00000000-0000-4000-b000-000000000000"]+ args["11111111-1111-4111-b111-111111111111"])}`],
        ["Multiple references maths", "@@00000000-0000-4000-b000-000000000000 ^ @@11111111-1111-4111-b111-111111111111 / @@22222222-2222-4222-b222-222222222222 - @@33333333-3333-4333-b333-333333333333", `function (args){return ((Math.pow(args[\"00000000-0000-4000-b000-000000000000\"],args[\"11111111-1111-4111-b111-111111111111\"])/ args[\"22222222-2222-4222-b222-222222222222\"])- args[\"33333333-3333-4333-b333-333333333333\"])}`],

        ["Constant: PI", "PI", `function (){return Math.PI}`],
        ["Constant: E",  "E",  `function (){return Math.E}`],

        ["1 arg function: sin",    "sin(1)",    `function (){return Math.sin(1)}`],
        ["1 arg function: cos",    "cos(1)",    `function (){return Math.cos(1)}`],
        ["1 arg function: tan",    "tan(1)",    `function (){return Math.tan(1)}`],
        ["1 arg function: arcsin", "arcsin(1)", `function (){return Math.asin(1)}`],
        ["1 arg function: arccos", "arccos(1)", `function (){return Math.acos(1)}`],
        ["1 arg function: arctan", "arctan(1)", `function (){return Math.atan(1)}`],
        ["1 arg function: log10",  "log10(1)",  `function (){return Math.log10(1)}`],
        ["1 arg function: ln",     "ln(1)",     `function (){return Math.log(1)}`],

        ["2 arg function: log",    "log(9, 3)", `function (){return (Math.log10(9)/Math.log10(3))}`],
    ]



    specs.forEach(([test_name, input, expected_result, expect_error]) =>
    {
        const original_console_error = console.error
        const errors = []
        console.error = function (error: any)
        {
            errors.push(error)
        }

        try
        {
            const result = equation_to_javascript(input, compact_test_javascript)
            console.error = original_console_error

            if (expect_error) test(errors.length > 0, true, test_name)
            else test(result, expected_result, test_name)
        }
        catch (e)
        {
            console.error = original_console_error
            throw e
        }
    })


}


// run_tests()
