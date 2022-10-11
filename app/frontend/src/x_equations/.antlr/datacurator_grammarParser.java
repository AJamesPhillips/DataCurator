// Generated from /Users/ajp/projects/DataCurator/app/frontend/src/x_equations/datacurator_grammar.g4 by ANTLR 4.9.2
import org.antlr.v4.runtime.atn.*;
import org.antlr.v4.runtime.dfa.DFA;
import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.misc.*;
import org.antlr.v4.runtime.tree.*;
import java.util.List;
import java.util.Iterator;
import java.util.ArrayList;

@SuppressWarnings({"all", "warnings", "unchecked", "unused", "cast"})
public class datacurator_grammarParser extends Parser {
	static { RuntimeMetaData.checkVersion("4.9.2", RuntimeMetaData.VERSION); }

	protected static final DFA[] _decisionToDFA;
	protected static final PredictionContextCache _sharedContextCache =
		new PredictionContextCache();
	public static final int
		T__0=1, T__1=2, T__2=3, POW=4, MUL=5, DIV=6, ADD=7, SUB=8, NUMBER=9, CONSTANTS=10, 
		ARG_FUNKTION=11, ARG2_FUNKTION=12, ID_REF=13, ID_REF_12CHAR=14, ID_REF_8CHAR=15, 
		ID_REF_4CHAR=16, ID_REF_3CHAR=17, ID_REF_CHAR=18, WHITESPACE=19;
	public static final int
		RULE_equation = 0, RULE_expression = 1, RULE_subexpression = 2;
	private static String[] makeRuleNames() {
		return new String[] {
			"equation", "expression", "subexpression"
		};
	}
	public static final String[] ruleNames = makeRuleNames();

	private static String[] makeLiteralNames() {
		return new String[] {
			null, "'('", "')'", "','", "'^'", "'*'", "'/'", "'+'", "'-'", null, null, 
			null, "'log'"
		};
	}
	private static final String[] _LITERAL_NAMES = makeLiteralNames();
	private static String[] makeSymbolicNames() {
		return new String[] {
			null, null, null, null, "POW", "MUL", "DIV", "ADD", "SUB", "NUMBER", 
			"CONSTANTS", "ARG_FUNKTION", "ARG2_FUNKTION", "ID_REF", "ID_REF_12CHAR", 
			"ID_REF_8CHAR", "ID_REF_4CHAR", "ID_REF_3CHAR", "ID_REF_CHAR", "WHITESPACE"
		};
	}
	private static final String[] _SYMBOLIC_NAMES = makeSymbolicNames();
	public static final Vocabulary VOCABULARY = new VocabularyImpl(_LITERAL_NAMES, _SYMBOLIC_NAMES);

	/**
	 * @deprecated Use {@link #VOCABULARY} instead.
	 */
	@Deprecated
	public static final String[] tokenNames;
	static {
		tokenNames = new String[_SYMBOLIC_NAMES.length];
		for (int i = 0; i < tokenNames.length; i++) {
			tokenNames[i] = VOCABULARY.getLiteralName(i);
			if (tokenNames[i] == null) {
				tokenNames[i] = VOCABULARY.getSymbolicName(i);
			}

			if (tokenNames[i] == null) {
				tokenNames[i] = "<INVALID>";
			}
		}
	}

	@Override
	@Deprecated
	public String[] getTokenNames() {
		return tokenNames;
	}

	@Override

	public Vocabulary getVocabulary() {
		return VOCABULARY;
	}

	@Override
	public String getGrammarFileName() { return "datacurator_grammar.g4"; }

	@Override
	public String[] getRuleNames() { return ruleNames; }

	@Override
	public String getSerializedATN() { return _serializedATN; }

	@Override
	public ATN getATN() { return _ATN; }

	public datacurator_grammarParser(TokenStream input) {
		super(input);
		_interp = new ParserATNSimulator(this,_ATN,_decisionToDFA,_sharedContextCache);
	}

	public static class EquationContext extends ParserRuleContext {
		public TerminalNode EOF() { return getToken(datacurator_grammarParser.EOF, 0); }
		public List<ExpressionContext> expression() {
			return getRuleContexts(ExpressionContext.class);
		}
		public ExpressionContext expression(int i) {
			return getRuleContext(ExpressionContext.class,i);
		}
		public EquationContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_equation; }
	}

	public final EquationContext equation() throws RecognitionException {
		EquationContext _localctx = new EquationContext(_ctx, getState());
		enterRule(_localctx, 0, RULE_equation);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(9);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while ((((_la) & ~0x3f) == 0 && ((1L << _la) & ((1L << T__0) | (1L << NUMBER) | (1L << CONSTANTS) | (1L << ARG_FUNKTION) | (1L << ARG2_FUNKTION) | (1L << ID_REF))) != 0)) {
				{
				{
				setState(6);
				expression(0);
				}
				}
				setState(11);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			setState(12);
			match(EOF);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static class ExpressionContext extends ParserRuleContext {
		public ExpressionContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_expression; }
	 
		public ExpressionContext() { }
		public void copyFrom(ExpressionContext ctx) {
			super.copyFrom(ctx);
		}
	}
	public static class NumberContext extends ExpressionContext {
		public TerminalNode NUMBER() { return getToken(datacurator_grammarParser.NUMBER, 0); }
		public NumberContext(ExpressionContext ctx) { copyFrom(ctx); }
	}
	public static class FunctionsWith2ArgsContext extends ExpressionContext {
		public Token arg_funktion;
		public ExpressionContext arg1;
		public ExpressionContext arg2;
		public TerminalNode ARG2_FUNKTION() { return getToken(datacurator_grammarParser.ARG2_FUNKTION, 0); }
		public List<ExpressionContext> expression() {
			return getRuleContexts(ExpressionContext.class);
		}
		public ExpressionContext expression(int i) {
			return getRuleContext(ExpressionContext.class,i);
		}
		public FunctionsWith2ArgsContext(ExpressionContext ctx) { copyFrom(ctx); }
	}
	public static class FunctionsWithArgsContext extends ExpressionContext {
		public Token arg_funktion;
		public ExpressionContext arg1;
		public TerminalNode ARG_FUNKTION() { return getToken(datacurator_grammarParser.ARG_FUNKTION, 0); }
		public ExpressionContext expression() {
			return getRuleContext(ExpressionContext.class,0);
		}
		public FunctionsWithArgsContext(ExpressionContext ctx) { copyFrom(ctx); }
	}
	public static class AdditionOrSubtractionContext extends ExpressionContext {
		public ExpressionContext left;
		public Token ADD;
		public List<Token> rest_operators = new ArrayList<Token>();
		public Token SUB;
		public Token _tset228;
		public SubexpressionContext subexpression;
		public List<SubexpressionContext> rest = new ArrayList<SubexpressionContext>();
		public ExpressionContext expression() {
			return getRuleContext(ExpressionContext.class,0);
		}
		public List<SubexpressionContext> subexpression() {
			return getRuleContexts(SubexpressionContext.class);
		}
		public SubexpressionContext subexpression(int i) {
			return getRuleContext(SubexpressionContext.class,i);
		}
		public List<TerminalNode> ADD() { return getTokens(datacurator_grammarParser.ADD); }
		public TerminalNode ADD(int i) {
			return getToken(datacurator_grammarParser.ADD, i);
		}
		public List<TerminalNode> SUB() { return getTokens(datacurator_grammarParser.SUB); }
		public TerminalNode SUB(int i) {
			return getToken(datacurator_grammarParser.SUB, i);
		}
		public AdditionOrSubtractionContext(ExpressionContext ctx) { copyFrom(ctx); }
	}
	public static class ConstantsContext extends ExpressionContext {
		public Token constants;
		public TerminalNode CONSTANTS() { return getToken(datacurator_grammarParser.CONSTANTS, 0); }
		public ConstantsContext(ExpressionContext ctx) { copyFrom(ctx); }
	}
	public static class MultiplicationOrDivisionContext extends ExpressionContext {
		public ExpressionContext left;
		public Token MUL;
		public List<Token> rest_operators = new ArrayList<Token>();
		public Token DIV;
		public Token _tset189;
		public SubexpressionContext subexpression;
		public List<SubexpressionContext> rest = new ArrayList<SubexpressionContext>();
		public ExpressionContext expression() {
			return getRuleContext(ExpressionContext.class,0);
		}
		public List<SubexpressionContext> subexpression() {
			return getRuleContexts(SubexpressionContext.class);
		}
		public SubexpressionContext subexpression(int i) {
			return getRuleContext(SubexpressionContext.class,i);
		}
		public List<TerminalNode> MUL() { return getTokens(datacurator_grammarParser.MUL); }
		public TerminalNode MUL(int i) {
			return getToken(datacurator_grammarParser.MUL, i);
		}
		public List<TerminalNode> DIV() { return getTokens(datacurator_grammarParser.DIV); }
		public TerminalNode DIV(int i) {
			return getToken(datacurator_grammarParser.DIV, i);
		}
		public MultiplicationOrDivisionContext(ExpressionContext ctx) { copyFrom(ctx); }
	}
	public static class IDRefContext extends ExpressionContext {
		public TerminalNode ID_REF() { return getToken(datacurator_grammarParser.ID_REF, 0); }
		public IDRefContext(ExpressionContext ctx) { copyFrom(ctx); }
	}
	public static class ParenthesesContext extends ExpressionContext {
		public ExpressionContext inner;
		public ExpressionContext expression() {
			return getRuleContext(ExpressionContext.class,0);
		}
		public ParenthesesContext(ExpressionContext ctx) { copyFrom(ctx); }
	}
	public static class PowerContext extends ExpressionContext {
		public ExpressionContext left;
		public Token operator;
		public ExpressionContext right;
		public List<ExpressionContext> expression() {
			return getRuleContexts(ExpressionContext.class);
		}
		public ExpressionContext expression(int i) {
			return getRuleContext(ExpressionContext.class,i);
		}
		public TerminalNode POW() { return getToken(datacurator_grammarParser.POW, 0); }
		public PowerContext(ExpressionContext ctx) { copyFrom(ctx); }
	}

	public final ExpressionContext expression() throws RecognitionException {
		return expression(0);
	}

	private ExpressionContext expression(int _p) throws RecognitionException {
		ParserRuleContext _parentctx = _ctx;
		int _parentState = getState();
		ExpressionContext _localctx = new ExpressionContext(_ctx, _parentState);
		ExpressionContext _prevctx = _localctx;
		int _startState = 2;
		enterRecursionRule(_localctx, 2, RULE_expression, _p);
		int _la;
		try {
			int _alt;
			enterOuterAlt(_localctx, 1);
			{
			setState(34);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case NUMBER:
				{
				_localctx = new NumberContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;

				setState(15);
				match(NUMBER);
				}
				break;
			case ID_REF:
				{
				_localctx = new IDRefContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(16);
				match(ID_REF);
				}
				break;
			case T__0:
				{
				_localctx = new ParenthesesContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(17);
				match(T__0);
				setState(18);
				((ParenthesesContext)_localctx).inner = expression(0);
				setState(19);
				match(T__1);
				}
				break;
			case ARG2_FUNKTION:
				{
				_localctx = new FunctionsWith2ArgsContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(21);
				((FunctionsWith2ArgsContext)_localctx).arg_funktion = match(ARG2_FUNKTION);
				setState(22);
				match(T__0);
				setState(23);
				((FunctionsWith2ArgsContext)_localctx).arg1 = expression(0);
				setState(24);
				match(T__2);
				setState(25);
				((FunctionsWith2ArgsContext)_localctx).arg2 = expression(0);
				setState(26);
				match(T__1);
				}
				break;
			case ARG_FUNKTION:
				{
				_localctx = new FunctionsWithArgsContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(28);
				((FunctionsWithArgsContext)_localctx).arg_funktion = match(ARG_FUNKTION);
				setState(29);
				match(T__0);
				setState(30);
				((FunctionsWithArgsContext)_localctx).arg1 = expression(0);
				setState(31);
				match(T__1);
				}
				break;
			case CONSTANTS:
				{
				_localctx = new ConstantsContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(33);
				((ConstantsContext)_localctx).constants = match(CONSTANTS);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			_ctx.stop = _input.LT(-1);
			setState(55);
			_errHandler.sync(this);
			_alt = getInterpreter().adaptivePredict(_input,5,_ctx);
			while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
				if ( _alt==1 ) {
					if ( _parseListeners!=null ) triggerExitRuleEvent();
					_prevctx = _localctx;
					{
					setState(53);
					_errHandler.sync(this);
					switch ( getInterpreter().adaptivePredict(_input,4,_ctx) ) {
					case 1:
						{
						_localctx = new PowerContext(new ExpressionContext(_parentctx, _parentState));
						((PowerContext)_localctx).left = _prevctx;
						pushNewRecursionContext(_localctx, _startState, RULE_expression);
						setState(36);
						if (!(precpred(_ctx, 3))) throw new FailedPredicateException(this, "precpred(_ctx, 3)");
						setState(37);
						((PowerContext)_localctx).operator = match(POW);
						setState(38);
						((PowerContext)_localctx).right = expression(4);
						}
						break;
					case 2:
						{
						_localctx = new MultiplicationOrDivisionContext(new ExpressionContext(_parentctx, _parentState));
						((MultiplicationOrDivisionContext)_localctx).left = _prevctx;
						pushNewRecursionContext(_localctx, _startState, RULE_expression);
						setState(39);
						if (!(precpred(_ctx, 2))) throw new FailedPredicateException(this, "precpred(_ctx, 2)");
						setState(42); 
						_errHandler.sync(this);
						_alt = 1;
						do {
							switch (_alt) {
							case 1:
								{
								{
								setState(40);
								((MultiplicationOrDivisionContext)_localctx)._tset189 = _input.LT(1);
								_la = _input.LA(1);
								if ( !(_la==MUL || _la==DIV) ) {
									((MultiplicationOrDivisionContext)_localctx)._tset189 = (Token)_errHandler.recoverInline(this);
								}
								else {
									if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
									_errHandler.reportMatch(this);
									consume();
								}
								((MultiplicationOrDivisionContext)_localctx).rest_operators.add(((MultiplicationOrDivisionContext)_localctx)._tset189);
								setState(41);
								((MultiplicationOrDivisionContext)_localctx).subexpression = subexpression();
								((MultiplicationOrDivisionContext)_localctx).rest.add(((MultiplicationOrDivisionContext)_localctx).subexpression);
								}
								}
								break;
							default:
								throw new NoViableAltException(this);
							}
							setState(44); 
							_errHandler.sync(this);
							_alt = getInterpreter().adaptivePredict(_input,2,_ctx);
						} while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER );
						}
						break;
					case 3:
						{
						_localctx = new AdditionOrSubtractionContext(new ExpressionContext(_parentctx, _parentState));
						((AdditionOrSubtractionContext)_localctx).left = _prevctx;
						pushNewRecursionContext(_localctx, _startState, RULE_expression);
						setState(46);
						if (!(precpred(_ctx, 1))) throw new FailedPredicateException(this, "precpred(_ctx, 1)");
						setState(49); 
						_errHandler.sync(this);
						_alt = 1;
						do {
							switch (_alt) {
							case 1:
								{
								{
								setState(47);
								((AdditionOrSubtractionContext)_localctx)._tset228 = _input.LT(1);
								_la = _input.LA(1);
								if ( !(_la==ADD || _la==SUB) ) {
									((AdditionOrSubtractionContext)_localctx)._tset228 = (Token)_errHandler.recoverInline(this);
								}
								else {
									if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
									_errHandler.reportMatch(this);
									consume();
								}
								((AdditionOrSubtractionContext)_localctx).rest_operators.add(((AdditionOrSubtractionContext)_localctx)._tset228);
								setState(48);
								((AdditionOrSubtractionContext)_localctx).subexpression = subexpression();
								((AdditionOrSubtractionContext)_localctx).rest.add(((AdditionOrSubtractionContext)_localctx).subexpression);
								}
								}
								break;
							default:
								throw new NoViableAltException(this);
							}
							setState(51); 
							_errHandler.sync(this);
							_alt = getInterpreter().adaptivePredict(_input,3,_ctx);
						} while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER );
						}
						break;
					}
					} 
				}
				setState(57);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,5,_ctx);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}

	public static class SubexpressionContext extends ParserRuleContext {
		public TerminalNode NUMBER() { return getToken(datacurator_grammarParser.NUMBER, 0); }
		public TerminalNode ID_REF() { return getToken(datacurator_grammarParser.ID_REF, 0); }
		public ExpressionContext expression() {
			return getRuleContext(ExpressionContext.class,0);
		}
		public SubexpressionContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_subexpression; }
	}

	public final SubexpressionContext subexpression() throws RecognitionException {
		SubexpressionContext _localctx = new SubexpressionContext(_ctx, getState());
		enterRule(_localctx, 4, RULE_subexpression);
		try {
			setState(61);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,6,_ctx) ) {
			case 1:
				enterOuterAlt(_localctx, 1);
				{
				setState(58);
				match(NUMBER);
				}
				break;
			case 2:
				enterOuterAlt(_localctx, 2);
				{
				setState(59);
				match(ID_REF);
				}
				break;
			case 3:
				enterOuterAlt(_localctx, 3);
				{
				setState(60);
				expression(0);
				}
				break;
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public boolean sempred(RuleContext _localctx, int ruleIndex, int predIndex) {
		switch (ruleIndex) {
		case 1:
			return expression_sempred((ExpressionContext)_localctx, predIndex);
		}
		return true;
	}
	private boolean expression_sempred(ExpressionContext _localctx, int predIndex) {
		switch (predIndex) {
		case 0:
			return precpred(_ctx, 3);
		case 1:
			return precpred(_ctx, 2);
		case 2:
			return precpred(_ctx, 1);
		}
		return true;
	}

	public static final String _serializedATN =
		"\3\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964\3\25B\4\2\t\2\4\3\t"+
		"\3\4\4\t\4\3\2\7\2\n\n\2\f\2\16\2\r\13\2\3\2\3\2\3\3\3\3\3\3\3\3\3\3\3"+
		"\3\3\3\3\3\3\3\3\3\3\3\3\3\3\3\3\3\3\3\3\3\3\3\3\3\3\3\3\3\5\3%\n\3\3"+
		"\3\3\3\3\3\3\3\3\3\3\3\6\3-\n\3\r\3\16\3.\3\3\3\3\3\3\6\3\64\n\3\r\3\16"+
		"\3\65\7\38\n\3\f\3\16\3;\13\3\3\4\3\4\3\4\5\4@\n\4\3\4\2\3\4\5\2\4\6\2"+
		"\4\3\2\7\b\3\2\t\n\2K\2\13\3\2\2\2\4$\3\2\2\2\6?\3\2\2\2\b\n\5\4\3\2\t"+
		"\b\3\2\2\2\n\r\3\2\2\2\13\t\3\2\2\2\13\f\3\2\2\2\f\16\3\2\2\2\r\13\3\2"+
		"\2\2\16\17\7\2\2\3\17\3\3\2\2\2\20\21\b\3\1\2\21%\7\13\2\2\22%\7\17\2"+
		"\2\23\24\7\3\2\2\24\25\5\4\3\2\25\26\7\4\2\2\26%\3\2\2\2\27\30\7\16\2"+
		"\2\30\31\7\3\2\2\31\32\5\4\3\2\32\33\7\5\2\2\33\34\5\4\3\2\34\35\7\4\2"+
		"\2\35%\3\2\2\2\36\37\7\r\2\2\37 \7\3\2\2 !\5\4\3\2!\"\7\4\2\2\"%\3\2\2"+
		"\2#%\7\f\2\2$\20\3\2\2\2$\22\3\2\2\2$\23\3\2\2\2$\27\3\2\2\2$\36\3\2\2"+
		"\2$#\3\2\2\2%9\3\2\2\2&\'\f\5\2\2\'(\7\6\2\2(8\5\4\3\6),\f\4\2\2*+\t\2"+
		"\2\2+-\5\6\4\2,*\3\2\2\2-.\3\2\2\2.,\3\2\2\2./\3\2\2\2/8\3\2\2\2\60\63"+
		"\f\3\2\2\61\62\t\3\2\2\62\64\5\6\4\2\63\61\3\2\2\2\64\65\3\2\2\2\65\63"+
		"\3\2\2\2\65\66\3\2\2\2\668\3\2\2\2\67&\3\2\2\2\67)\3\2\2\2\67\60\3\2\2"+
		"\28;\3\2\2\29\67\3\2\2\29:\3\2\2\2:\5\3\2\2\2;9\3\2\2\2<@\7\13\2\2=@\7"+
		"\17\2\2>@\5\4\3\2?<\3\2\2\2?=\3\2\2\2?>\3\2\2\2@\7\3\2\2\2\t\13$.\65\67"+
		"9?";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}