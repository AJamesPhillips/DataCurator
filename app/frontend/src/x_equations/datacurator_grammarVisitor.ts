// Generated from src/x_equations/datacurator_grammar.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { AdditionOrSubtractionContext, ConstantsContext, EquationContext, ExpressionContext, FunctionsWith2ArgsContext, FunctionsWithArgsContext, IDRefContext, MultiplicationOrDivisionContext, NumberContext, ParenthesesContext, PowerContext, SubexpressionContext } from "./datacurator_grammarParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `datacurator_grammarParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface datacurator_grammarVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by the `Number`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNumber?: (ctx: NumberContext) => Result;

	/**
	 * Visit a parse tree produced by the `IDRef`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIDRef?: (ctx: IDRefContext) => Result;

	/**
	 * Visit a parse tree produced by the `Parentheses`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParentheses?: (ctx: ParenthesesContext) => Result;

	/**
	 * Visit a parse tree produced by the `FunctionsWith2Args`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFunctionsWith2Args?: (ctx: FunctionsWith2ArgsContext) => Result;

	/**
	 * Visit a parse tree produced by the `FunctionsWithArgs`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFunctionsWithArgs?: (ctx: FunctionsWithArgsContext) => Result;

	/**
	 * Visit a parse tree produced by the `Constants`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConstants?: (ctx: ConstantsContext) => Result;

	/**
	 * Visit a parse tree produced by the `Power`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPower?: (ctx: PowerContext) => Result;

	/**
	 * Visit a parse tree produced by the `MultiplicationOrDivision`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMultiplicationOrDivision?: (ctx: MultiplicationOrDivisionContext) => Result;

	/**
	 * Visit a parse tree produced by the `AdditionOrSubtraction`
	 * labeled alternative in `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAdditionOrSubtraction?: (ctx: AdditionOrSubtractionContext) => Result;

	/**
	 * Visit a parse tree produced by `datacurator_grammarParser.equation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEquation?: (ctx: EquationContext) => Result;

	/**
	 * Visit a parse tree produced by `datacurator_grammarParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpression?: (ctx: ExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by `datacurator_grammarParser.subexpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSubexpression?: (ctx: SubexpressionContext) => Result;
}
