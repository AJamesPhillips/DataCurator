// Generated from src/x_equations/datacurator_grammar.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { NotNull } from "antlr4ts/Decorators";
import { NoViableAltException } from "antlr4ts/NoViableAltException";
import { Override } from "antlr4ts/Decorators";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { RecognitionException } from "antlr4ts/RecognitionException";
import { RuleContext } from "antlr4ts/RuleContext";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Token } from "antlr4ts/Token";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";

import { datacurator_grammarListener } from "./datacurator_grammarListener";
import { datacurator_grammarVisitor } from "./datacurator_grammarVisitor";


export class datacurator_grammarParser extends Parser {
	public static readonly T__0 = 1;
	public static readonly T__1 = 2;
	public static readonly T__2 = 3;
	public static readonly POW = 4;
	public static readonly MUL = 5;
	public static readonly DIV = 6;
	public static readonly ADD = 7;
	public static readonly SUB = 8;
	public static readonly NUMBER = 9;
	public static readonly CONSTANTS = 10;
	public static readonly ARG_FUNKTION = 11;
	public static readonly ARG2_FUNKTION = 12;
	public static readonly ID_REF = 13;
	public static readonly ID_REF_12CHAR = 14;
	public static readonly ID_REF_8CHAR = 15;
	public static readonly ID_REF_4CHAR = 16;
	public static readonly ID_REF_3CHAR = 17;
	public static readonly ID_REF_CHAR = 18;
	public static readonly WHITESPACE = 19;
	public static readonly RULE_equation = 0;
	public static readonly RULE_expression = 1;
	public static readonly RULE_subexpression = 2;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"equation", "expression", "subexpression",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'('", "')'", "','", "'^'", "'*'", "'/'", "'+'", "'-'", undefined, 
		undefined, undefined, "'log'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, "POW", "MUL", "DIV", "ADD", 
		"SUB", "NUMBER", "CONSTANTS", "ARG_FUNKTION", "ARG2_FUNKTION", "ID_REF", 
		"ID_REF_12CHAR", "ID_REF_8CHAR", "ID_REF_4CHAR", "ID_REF_3CHAR", "ID_REF_CHAR", 
		"WHITESPACE",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(datacurator_grammarParser._LITERAL_NAMES, datacurator_grammarParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return datacurator_grammarParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "datacurator_grammar.g4"; }

	// @Override
	public get ruleNames(): string[] { return datacurator_grammarParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return datacurator_grammarParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(datacurator_grammarParser._ATN, this);
	}
	// @RuleVersion(0)
	public equation(): EquationContext {
		let _localctx: EquationContext = new EquationContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, datacurator_grammarParser.RULE_equation);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 9;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << datacurator_grammarParser.T__0) | (1 << datacurator_grammarParser.NUMBER) | (1 << datacurator_grammarParser.CONSTANTS) | (1 << datacurator_grammarParser.ARG_FUNKTION) | (1 << datacurator_grammarParser.ARG2_FUNKTION) | (1 << datacurator_grammarParser.ID_REF))) !== 0)) {
				{
				{
				this.state = 6;
				this.expression(0);
				}
				}
				this.state = 11;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 12;
			this.match(datacurator_grammarParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public expression(): ExpressionContext;
	public expression(_p: number): ExpressionContext;
	// @RuleVersion(0)
	public expression(_p?: number): ExpressionContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let _localctx: ExpressionContext = new ExpressionContext(this._ctx, _parentState);
		let _prevctx: ExpressionContext = _localctx;
		let _startState: number = 2;
		this.enterRecursionRule(_localctx, 2, datacurator_grammarParser.RULE_expression, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 34;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case datacurator_grammarParser.NUMBER:
				{
				_localctx = new NumberContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 15;
				this.match(datacurator_grammarParser.NUMBER);
				}
				break;
			case datacurator_grammarParser.ID_REF:
				{
				_localctx = new IDRefContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 16;
				this.match(datacurator_grammarParser.ID_REF);
				}
				break;
			case datacurator_grammarParser.T__0:
				{
				_localctx = new ParenthesesContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 17;
				this.match(datacurator_grammarParser.T__0);
				this.state = 18;
				(_localctx as ParenthesesContext)._inner = this.expression(0);
				this.state = 19;
				this.match(datacurator_grammarParser.T__1);
				}
				break;
			case datacurator_grammarParser.ARG2_FUNKTION:
				{
				_localctx = new FunctionsWith2ArgsContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 21;
				(_localctx as FunctionsWith2ArgsContext)._arg_funktion = this.match(datacurator_grammarParser.ARG2_FUNKTION);
				this.state = 22;
				this.match(datacurator_grammarParser.T__0);
				this.state = 23;
				(_localctx as FunctionsWith2ArgsContext)._arg1 = this.expression(0);
				this.state = 24;
				this.match(datacurator_grammarParser.T__2);
				this.state = 25;
				(_localctx as FunctionsWith2ArgsContext)._arg2 = this.expression(0);
				this.state = 26;
				this.match(datacurator_grammarParser.T__1);
				}
				break;
			case datacurator_grammarParser.ARG_FUNKTION:
				{
				_localctx = new FunctionsWithArgsContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 28;
				(_localctx as FunctionsWithArgsContext)._arg_funktion = this.match(datacurator_grammarParser.ARG_FUNKTION);
				this.state = 29;
				this.match(datacurator_grammarParser.T__0);
				this.state = 30;
				(_localctx as FunctionsWithArgsContext)._arg1 = this.expression(0);
				this.state = 31;
				this.match(datacurator_grammarParser.T__1);
				}
				break;
			case datacurator_grammarParser.CONSTANTS:
				{
				_localctx = new ConstantsContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 33;
				(_localctx as ConstantsContext)._constants = this.match(datacurator_grammarParser.CONSTANTS);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 55;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 5, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 53;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 4, this._ctx) ) {
					case 1:
						{
						_localctx = new PowerContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as PowerContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, datacurator_grammarParser.RULE_expression);
						this.state = 36;
						if (!(this.precpred(this._ctx, 3))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 3)");
						}
						this.state = 37;
						(_localctx as PowerContext)._operator = this.match(datacurator_grammarParser.POW);
						this.state = 38;
						(_localctx as PowerContext)._right = this.expression(4);
						}
						break;

					case 2:
						{
						_localctx = new MultiplicationOrDivisionContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as MultiplicationOrDivisionContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, datacurator_grammarParser.RULE_expression);
						this.state = 39;
						if (!(this.precpred(this._ctx, 2))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
						}
						this.state = 42;
						this._errHandler.sync(this);
						_alt = 1;
						do {
							switch (_alt) {
							case 1:
								{
								{
								this.state = 40;
								(_localctx as MultiplicationOrDivisionContext).__tset189 = this._input.LT(1);
								_la = this._input.LA(1);
								if (!(_la === datacurator_grammarParser.MUL || _la === datacurator_grammarParser.DIV)) {
									(_localctx as MultiplicationOrDivisionContext).__tset189 = this._errHandler.recoverInline(this);
								} else {
									if (this._input.LA(1) === Token.EOF) {
										this.matchedEOF = true;
									}

									this._errHandler.reportMatch(this);
									this.consume();
								}
								(_localctx as MultiplicationOrDivisionContext)._rest_operators.push((_localctx as MultiplicationOrDivisionContext).__tset189);
								this.state = 41;
								(_localctx as MultiplicationOrDivisionContext)._subexpression = this.subexpression();
								(_localctx as MultiplicationOrDivisionContext)._rest.push((_localctx as MultiplicationOrDivisionContext)._subexpression);
								}
								}
								break;
							default:
								throw new NoViableAltException(this);
							}
							this.state = 44;
							this._errHandler.sync(this);
							_alt = this.interpreter.adaptivePredict(this._input, 2, this._ctx);
						} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
						}
						break;

					case 3:
						{
						_localctx = new AdditionOrSubtractionContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as AdditionOrSubtractionContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, datacurator_grammarParser.RULE_expression);
						this.state = 46;
						if (!(this.precpred(this._ctx, 1))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
						}
						this.state = 49;
						this._errHandler.sync(this);
						_alt = 1;
						do {
							switch (_alt) {
							case 1:
								{
								{
								this.state = 47;
								(_localctx as AdditionOrSubtractionContext).__tset228 = this._input.LT(1);
								_la = this._input.LA(1);
								if (!(_la === datacurator_grammarParser.ADD || _la === datacurator_grammarParser.SUB)) {
									(_localctx as AdditionOrSubtractionContext).__tset228 = this._errHandler.recoverInline(this);
								} else {
									if (this._input.LA(1) === Token.EOF) {
										this.matchedEOF = true;
									}

									this._errHandler.reportMatch(this);
									this.consume();
								}
								(_localctx as AdditionOrSubtractionContext)._rest_operators.push((_localctx as AdditionOrSubtractionContext).__tset228);
								this.state = 48;
								(_localctx as AdditionOrSubtractionContext)._subexpression = this.subexpression();
								(_localctx as AdditionOrSubtractionContext)._rest.push((_localctx as AdditionOrSubtractionContext)._subexpression);
								}
								}
								break;
							default:
								throw new NoViableAltException(this);
							}
							this.state = 51;
							this._errHandler.sync(this);
							_alt = this.interpreter.adaptivePredict(this._input, 3, this._ctx);
						} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
						}
						break;
					}
					}
				}
				this.state = 57;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 5, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public subexpression(): SubexpressionContext {
		let _localctx: SubexpressionContext = new SubexpressionContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, datacurator_grammarParser.RULE_subexpression);
		try {
			this.state = 61;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 6, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 58;
				this.match(datacurator_grammarParser.NUMBER);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 59;
				this.match(datacurator_grammarParser.ID_REF);
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 60;
				this.expression(0);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 1:
			return this.expression_sempred(_localctx as ExpressionContext, predIndex);
		}
		return true;
	}
	private expression_sempred(_localctx: ExpressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 3);

		case 1:
			return this.precpred(this._ctx, 2);

		case 2:
			return this.precpred(this._ctx, 1);
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03\x15B\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x03\x02\x07\x02\n\n\x02\f\x02\x0E\x02" +
		"\r\v\x02\x03\x02\x03\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x05\x03%\n\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x06\x03-\n\x03\r\x03\x0E\x03.\x03\x03" +
		"\x03\x03\x03\x03\x06\x034\n\x03\r\x03\x0E\x035\x07\x038\n\x03\f\x03\x0E" +
		"\x03;\v\x03\x03\x04\x03\x04\x03\x04\x05\x04@\n\x04\x03\x04\x02\x02\x03" +
		"\x04\x05\x02\x02\x04\x02\x06\x02\x02\x04\x03\x02\x07\b\x03\x02\t\n\x02" +
		"K\x02\v\x03\x02\x02\x02\x04$\x03\x02\x02\x02\x06?\x03\x02\x02\x02\b\n" +
		"\x05\x04\x03\x02\t\b\x03\x02\x02\x02\n\r\x03\x02\x02\x02\v\t\x03\x02\x02" +
		"\x02\v\f\x03\x02\x02\x02\f\x0E\x03\x02\x02\x02\r\v\x03\x02\x02\x02\x0E" +
		"\x0F\x07\x02\x02\x03\x0F\x03\x03\x02\x02\x02\x10\x11\b\x03\x01\x02\x11" +
		"%\x07\v\x02\x02\x12%\x07\x0F\x02\x02\x13\x14\x07\x03\x02\x02\x14\x15\x05" +
		"\x04\x03\x02\x15\x16\x07\x04\x02\x02\x16%\x03\x02\x02\x02\x17\x18\x07" +
		"\x0E\x02\x02\x18\x19\x07\x03\x02\x02\x19\x1A\x05\x04\x03\x02\x1A\x1B\x07" +
		"\x05\x02\x02\x1B\x1C\x05\x04\x03\x02\x1C\x1D\x07\x04\x02\x02\x1D%\x03" +
		"\x02\x02\x02\x1E\x1F\x07\r\x02\x02\x1F \x07\x03\x02\x02 !\x05\x04\x03" +
		"\x02!\"\x07\x04\x02\x02\"%\x03\x02\x02\x02#%\x07\f\x02\x02$\x10\x03\x02" +
		"\x02\x02$\x12\x03\x02\x02\x02$\x13\x03\x02\x02\x02$\x17\x03\x02\x02\x02" +
		"$\x1E\x03\x02\x02\x02$#\x03\x02\x02\x02%9\x03\x02\x02\x02&\'\f\x05\x02" +
		"\x02\'(\x07\x06\x02\x02(8\x05\x04\x03\x06),\f\x04\x02\x02*+\t\x02\x02" +
		"\x02+-\x05\x06\x04\x02,*\x03\x02\x02\x02-.\x03\x02\x02\x02.,\x03\x02\x02" +
		"\x02./\x03\x02\x02\x02/8\x03\x02\x02\x0203\f\x03\x02\x0212\t\x03\x02\x02" +
		"24\x05\x06\x04\x0231\x03\x02\x02\x0245\x03\x02\x02\x0253\x03\x02\x02\x02" +
		"56\x03\x02\x02\x0268\x03\x02\x02\x027&\x03\x02\x02\x027)\x03\x02\x02\x02" +
		"70\x03\x02\x02\x028;\x03\x02\x02\x0297\x03\x02\x02\x029:\x03\x02\x02\x02" +
		":\x05\x03\x02\x02\x02;9\x03\x02\x02\x02<@\x07\v\x02\x02=@\x07\x0F\x02" +
		"\x02>@\x05\x04\x03\x02?<\x03\x02\x02\x02?=\x03\x02\x02\x02?>\x03\x02\x02" +
		"\x02@\x07\x03\x02\x02\x02\t\v$.579?";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!datacurator_grammarParser.__ATN) {
			datacurator_grammarParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(datacurator_grammarParser._serializedATN));
		}

		return datacurator_grammarParser.__ATN;
	}

}

export class EquationContext extends ParserRuleContext {
	public EOF(): TerminalNode { return this.getToken(datacurator_grammarParser.EOF, 0); }
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return datacurator_grammarParser.RULE_equation; }
	// @Override
	public enterRule(listener: datacurator_grammarListener): void {
		if (listener.enterEquation) {
			listener.enterEquation(this);
		}
	}
	// @Override
	public exitRule(listener: datacurator_grammarListener): void {
		if (listener.exitEquation) {
			listener.exitEquation(this);
		}
	}
	// @Override
	public accept<Result>(visitor: datacurator_grammarVisitor<Result>): Result {
		if (visitor.visitEquation) {
			return visitor.visitEquation(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExpressionContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return datacurator_grammarParser.RULE_expression; }
	public copyFrom(ctx: ExpressionContext): void {
		super.copyFrom(ctx);
	}
}
export class NumberContext extends ExpressionContext {
	public NUMBER(): TerminalNode { return this.getToken(datacurator_grammarParser.NUMBER, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: datacurator_grammarListener): void {
		if (listener.enterNumber) {
			listener.enterNumber(this);
		}
	}
	// @Override
	public exitRule(listener: datacurator_grammarListener): void {
		if (listener.exitNumber) {
			listener.exitNumber(this);
		}
	}
	// @Override
	public accept<Result>(visitor: datacurator_grammarVisitor<Result>): Result {
		if (visitor.visitNumber) {
			return visitor.visitNumber(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class IDRefContext extends ExpressionContext {
	public ID_REF(): TerminalNode { return this.getToken(datacurator_grammarParser.ID_REF, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: datacurator_grammarListener): void {
		if (listener.enterIDRef) {
			listener.enterIDRef(this);
		}
	}
	// @Override
	public exitRule(listener: datacurator_grammarListener): void {
		if (listener.exitIDRef) {
			listener.exitIDRef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: datacurator_grammarVisitor<Result>): Result {
		if (visitor.visitIDRef) {
			return visitor.visitIDRef(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ParenthesesContext extends ExpressionContext {
	public _inner!: ExpressionContext;
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: datacurator_grammarListener): void {
		if (listener.enterParentheses) {
			listener.enterParentheses(this);
		}
	}
	// @Override
	public exitRule(listener: datacurator_grammarListener): void {
		if (listener.exitParentheses) {
			listener.exitParentheses(this);
		}
	}
	// @Override
	public accept<Result>(visitor: datacurator_grammarVisitor<Result>): Result {
		if (visitor.visitParentheses) {
			return visitor.visitParentheses(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class FunctionsWith2ArgsContext extends ExpressionContext {
	public _arg_funktion!: Token;
	public _arg1!: ExpressionContext;
	public _arg2!: ExpressionContext;
	public ARG2_FUNKTION(): TerminalNode { return this.getToken(datacurator_grammarParser.ARG2_FUNKTION, 0); }
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: datacurator_grammarListener): void {
		if (listener.enterFunctionsWith2Args) {
			listener.enterFunctionsWith2Args(this);
		}
	}
	// @Override
	public exitRule(listener: datacurator_grammarListener): void {
		if (listener.exitFunctionsWith2Args) {
			listener.exitFunctionsWith2Args(this);
		}
	}
	// @Override
	public accept<Result>(visitor: datacurator_grammarVisitor<Result>): Result {
		if (visitor.visitFunctionsWith2Args) {
			return visitor.visitFunctionsWith2Args(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class FunctionsWithArgsContext extends ExpressionContext {
	public _arg_funktion!: Token;
	public _arg1!: ExpressionContext;
	public ARG_FUNKTION(): TerminalNode { return this.getToken(datacurator_grammarParser.ARG_FUNKTION, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: datacurator_grammarListener): void {
		if (listener.enterFunctionsWithArgs) {
			listener.enterFunctionsWithArgs(this);
		}
	}
	// @Override
	public exitRule(listener: datacurator_grammarListener): void {
		if (listener.exitFunctionsWithArgs) {
			listener.exitFunctionsWithArgs(this);
		}
	}
	// @Override
	public accept<Result>(visitor: datacurator_grammarVisitor<Result>): Result {
		if (visitor.visitFunctionsWithArgs) {
			return visitor.visitFunctionsWithArgs(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ConstantsContext extends ExpressionContext {
	public _constants!: Token;
	public CONSTANTS(): TerminalNode { return this.getToken(datacurator_grammarParser.CONSTANTS, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: datacurator_grammarListener): void {
		if (listener.enterConstants) {
			listener.enterConstants(this);
		}
	}
	// @Override
	public exitRule(listener: datacurator_grammarListener): void {
		if (listener.exitConstants) {
			listener.exitConstants(this);
		}
	}
	// @Override
	public accept<Result>(visitor: datacurator_grammarVisitor<Result>): Result {
		if (visitor.visitConstants) {
			return visitor.visitConstants(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class PowerContext extends ExpressionContext {
	public _left!: ExpressionContext;
	public _operator!: Token;
	public _right!: ExpressionContext;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public POW(): TerminalNode { return this.getToken(datacurator_grammarParser.POW, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: datacurator_grammarListener): void {
		if (listener.enterPower) {
			listener.enterPower(this);
		}
	}
	// @Override
	public exitRule(listener: datacurator_grammarListener): void {
		if (listener.exitPower) {
			listener.exitPower(this);
		}
	}
	// @Override
	public accept<Result>(visitor: datacurator_grammarVisitor<Result>): Result {
		if (visitor.visitPower) {
			return visitor.visitPower(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class MultiplicationOrDivisionContext extends ExpressionContext {
	public _left!: ExpressionContext;
	public _MUL!: Token;
	public _rest_operators: Token[] = [];
	public _DIV!: Token;
	public __tset189!: Token;
	public _subexpression!: SubexpressionContext;
	public _rest: SubexpressionContext[] = [];
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public subexpression(): SubexpressionContext[];
	public subexpression(i: number): SubexpressionContext;
	public subexpression(i?: number): SubexpressionContext | SubexpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(SubexpressionContext);
		} else {
			return this.getRuleContext(i, SubexpressionContext);
		}
	}
	public MUL(): TerminalNode[];
	public MUL(i: number): TerminalNode;
	public MUL(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(datacurator_grammarParser.MUL);
		} else {
			return this.getToken(datacurator_grammarParser.MUL, i);
		}
	}
	public DIV(): TerminalNode[];
	public DIV(i: number): TerminalNode;
	public DIV(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(datacurator_grammarParser.DIV);
		} else {
			return this.getToken(datacurator_grammarParser.DIV, i);
		}
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: datacurator_grammarListener): void {
		if (listener.enterMultiplicationOrDivision) {
			listener.enterMultiplicationOrDivision(this);
		}
	}
	// @Override
	public exitRule(listener: datacurator_grammarListener): void {
		if (listener.exitMultiplicationOrDivision) {
			listener.exitMultiplicationOrDivision(this);
		}
	}
	// @Override
	public accept<Result>(visitor: datacurator_grammarVisitor<Result>): Result {
		if (visitor.visitMultiplicationOrDivision) {
			return visitor.visitMultiplicationOrDivision(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class AdditionOrSubtractionContext extends ExpressionContext {
	public _left!: ExpressionContext;
	public _ADD!: Token;
	public _rest_operators: Token[] = [];
	public _SUB!: Token;
	public __tset228!: Token;
	public _subexpression!: SubexpressionContext;
	public _rest: SubexpressionContext[] = [];
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public subexpression(): SubexpressionContext[];
	public subexpression(i: number): SubexpressionContext;
	public subexpression(i?: number): SubexpressionContext | SubexpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(SubexpressionContext);
		} else {
			return this.getRuleContext(i, SubexpressionContext);
		}
	}
	public ADD(): TerminalNode[];
	public ADD(i: number): TerminalNode;
	public ADD(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(datacurator_grammarParser.ADD);
		} else {
			return this.getToken(datacurator_grammarParser.ADD, i);
		}
	}
	public SUB(): TerminalNode[];
	public SUB(i: number): TerminalNode;
	public SUB(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(datacurator_grammarParser.SUB);
		} else {
			return this.getToken(datacurator_grammarParser.SUB, i);
		}
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: datacurator_grammarListener): void {
		if (listener.enterAdditionOrSubtraction) {
			listener.enterAdditionOrSubtraction(this);
		}
	}
	// @Override
	public exitRule(listener: datacurator_grammarListener): void {
		if (listener.exitAdditionOrSubtraction) {
			listener.exitAdditionOrSubtraction(this);
		}
	}
	// @Override
	public accept<Result>(visitor: datacurator_grammarVisitor<Result>): Result {
		if (visitor.visitAdditionOrSubtraction) {
			return visitor.visitAdditionOrSubtraction(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SubexpressionContext extends ParserRuleContext {
	public NUMBER(): TerminalNode | undefined { return this.tryGetToken(datacurator_grammarParser.NUMBER, 0); }
	public ID_REF(): TerminalNode | undefined { return this.tryGetToken(datacurator_grammarParser.ID_REF, 0); }
	public expression(): ExpressionContext | undefined {
		return this.tryGetRuleContext(0, ExpressionContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return datacurator_grammarParser.RULE_subexpression; }
	// @Override
	public enterRule(listener: datacurator_grammarListener): void {
		if (listener.enterSubexpression) {
			listener.enterSubexpression(this);
		}
	}
	// @Override
	public exitRule(listener: datacurator_grammarListener): void {
		if (listener.exitSubexpression) {
			listener.exitSubexpression(this);
		}
	}
	// @Override
	public accept<Result>(visitor: datacurator_grammarVisitor<Result>): Result {
		if (visitor.visitSubexpression) {
			return visitor.visitSubexpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


