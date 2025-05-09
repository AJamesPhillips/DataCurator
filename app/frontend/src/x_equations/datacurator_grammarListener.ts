// Generated from src/x_equations/datacurator_grammar.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { AdditionOrSubtractionContext, ConstantsContext, EquationContext, ExpressionContext, FunctionsWith2ArgsContext, FunctionsWithArgsContext, IDRefContext, MultiplicationOrDivisionContext, NumberContext, ParenthesesContext, PowerContext, SubexpressionContext } from "./datacurator_grammarParser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `datacurator_grammarParser`.
 */
export interface datacurator_grammarListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by the `Number`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 */
	enterNumber?: (ctx: NumberContext) => void;
	/**
	 * Exit a parse tree produced by the `Number`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 */
	exitNumber?: (ctx: NumberContext) => void;

	/**
	 * Enter a parse tree produced by the `IDRef`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 */
	enterIDRef?: (ctx: IDRefContext) => void;
	/**
	 * Exit a parse tree produced by the `IDRef`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 */
	exitIDRef?: (ctx: IDRefContext) => void;

	/**
	 * Enter a parse tree produced by the `Parentheses`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 */
	enterParentheses?: (ctx: ParenthesesContext) => void;
	/**
	 * Exit a parse tree produced by the `Parentheses`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 */
	exitParentheses?: (ctx: ParenthesesContext) => void;

	/**
	 * Enter a parse tree produced by the `FunctionsWith2Args`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 */
	enterFunctionsWith2Args?: (ctx: FunctionsWith2ArgsContext) => void;
	/**
	 * Exit a parse tree produced by the `FunctionsWith2Args`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 */
	exitFunctionsWith2Args?: (ctx: FunctionsWith2ArgsContext) => void;

	/**
	 * Enter a parse tree produced by the `FunctionsWithArgs`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 */
	enterFunctionsWithArgs?: (ctx: FunctionsWithArgsContext) => void;
	/**
	 * Exit a parse tree produced by the `FunctionsWithArgs`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 */
	exitFunctionsWithArgs?: (ctx: FunctionsWithArgsContext) => void;

	/**
	 * Enter a parse tree produced by the `Constants`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 */
	enterConstants?: (ctx: ConstantsContext) => void;
	/**
	 * Exit a parse tree produced by the `Constants`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 */
	exitConstants?: (ctx: ConstantsContext) => void;

	/**
	 * Enter a parse tree produced by the `Power`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 */
	enterPower?: (ctx: PowerContext) => void;
	/**
	 * Exit a parse tree produced by the `Power`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 */
	exitPower?: (ctx: PowerContext) => void;

	/**
	 * Enter a parse tree produced by the `MultiplicationOrDivision`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 */
	enterMultiplicationOrDivision?: (ctx: MultiplicationOrDivisionContext) => void;
	/**
	 * Exit a parse tree produced by the `MultiplicationOrDivision`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 */
	exitMultiplicationOrDivision?: (ctx: MultiplicationOrDivisionContext) => void;

	/**
	 * Enter a parse tree produced by the `AdditionOrSubtraction`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 */
	enterAdditionOrSubtraction?: (ctx: AdditionOrSubtractionContext) => void;
	/**
	 * Exit a parse tree produced by the `AdditionOrSubtraction`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 */
	exitAdditionOrSubtraction?: (ctx: AdditionOrSubtractionContext) => void;

	/**
	 * Enter a parse tree produced by `datacurator_grammarParser.equation`.
	 * @param ctx the parse tree
	 */
	enterEquation?: (ctx: EquationContext) => void;
	/**
	 * Exit a parse tree produced by `datacurator_grammarParser.equation`.
	 * @param ctx the parse tree
	 */
	exitEquation?: (ctx: EquationContext) => void;

	/**
	 * Enter a parse tree produced by `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 */
	enterExpression?: (ctx: ExpressionContext) => void;
	/**
	 * Exit a parse tree produced by `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 */
	exitExpression?: (ctx: ExpressionContext) => void;

	/**
	 * Enter a parse tree produced by `datacurator_grammarParser.subexpression`.
	 * @param ctx the parse tree
	 */
	enterSubexpression?: (ctx: SubexpressionContext) => void;
	/**
	 * Exit a parse tree produced by `datacurator_grammarParser.subexpression`.
	 * @param ctx the parse tree
	 */
	exitSubexpression?: (ctx: SubexpressionContext) => void;
}
