// Generated from /Users/ajp/projects/DataCurator/app/frontend/src/x_equations/datacurator_grammar.g4 by ANTLR 4.9.2
import org.antlr.v4.runtime.Lexer;
import org.antlr.v4.runtime.CharStream;
import org.antlr.v4.runtime.Token;
import org.antlr.v4.runtime.TokenStream;
import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.atn.*;
import org.antlr.v4.runtime.dfa.DFA;
import org.antlr.v4.runtime.misc.*;

@SuppressWarnings({"all", "warnings", "unchecked", "unused", "cast"})
public class datacurator_grammarLexer extends Lexer {
	static { RuntimeMetaData.checkVersion("4.9.2", RuntimeMetaData.VERSION); }

	protected static final DFA[] _decisionToDFA;
	protected static final PredictionContextCache _sharedContextCache =
		new PredictionContextCache();
	public static final int
		T__0=1, T__1=2, T__2=3, POW=4, MUL=5, DIV=6, ADD=7, SUB=8, NUMBER=9, CONSTANTS=10, 
		ARG_FUNKTION=11, ARG2_FUNKTION=12, ID_REF=13, ID_REF_12CHAR=14, ID_REF_8CHAR=15, 
		ID_REF_4CHAR=16, ID_REF_3CHAR=17, ID_REF_CHAR=18, WHITESPACE=19;
	public static String[] channelNames = {
		"DEFAULT_TOKEN_CHANNEL", "HIDDEN"
	};

	public static String[] modeNames = {
		"DEFAULT_MODE"
	};

	private static String[] makeRuleNames() {
		return new String[] {
			"T__0", "T__1", "T__2", "POW", "MUL", "DIV", "ADD", "SUB", "DIGIT", "NUMBER", 
			"CONSTANTS", "ARG_FUNKTION", "ARG2_FUNKTION", "ID_REF", "ID_REF_12CHAR", 
			"ID_REF_8CHAR", "ID_REF_4CHAR", "ID_REF_3CHAR", "ID_REF_CHAR", "WHITESPACE"
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


	public datacurator_grammarLexer(CharStream input) {
		super(input);
		_interp = new LexerATNSimulator(this,_ATN,_decisionToDFA,_sharedContextCache);
	}

	@Override
	public String getGrammarFileName() { return "datacurator_grammar.g4"; }

	@Override
	public String[] getRuleNames() { return ruleNames; }

	@Override
	public String getSerializedATN() { return _serializedATN; }

	@Override
	public String[] getChannelNames() { return channelNames; }

	@Override
	public String[] getModeNames() { return modeNames; }

	@Override
	public ATN getATN() { return _ATN; }

	public static final String _serializedATN =
		"\3\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964\2\25\u00a3\b\1\4\2"+
		"\t\2\4\3\t\3\4\4\t\4\4\5\t\5\4\6\t\6\4\7\t\7\4\b\t\b\4\t\t\t\4\n\t\n\4"+
		"\13\t\13\4\f\t\f\4\r\t\r\4\16\t\16\4\17\t\17\4\20\t\20\4\21\t\21\4\22"+
		"\t\22\4\23\t\23\4\24\t\24\4\25\t\25\3\2\3\2\3\3\3\3\3\4\3\4\3\5\3\5\3"+
		"\6\3\6\3\7\3\7\3\b\3\b\3\t\3\t\3\n\3\n\3\13\5\13?\n\13\3\13\6\13B\n\13"+
		"\r\13\16\13C\3\13\3\13\6\13H\n\13\r\13\16\13I\5\13L\n\13\3\f\3\f\3\f\5"+
		"\fQ\n\f\3\r\3\r\3\r\3\r\3\r\3\r\3\r\3\r\3\r\3\r\3\r\3\r\3\r\3\r\3\r\3"+
		"\r\3\r\3\r\3\r\3\r\3\r\3\r\3\r\3\r\3\r\3\r\3\r\3\r\3\r\3\r\3\r\3\r\3\r"+
		"\3\r\5\ru\n\r\3\16\3\16\3\16\3\16\3\17\3\17\3\17\3\17\3\17\3\17\3\17\3"+
		"\17\3\17\3\17\3\17\3\17\3\17\3\17\3\17\3\17\3\20\3\20\3\20\3\20\3\21\3"+
		"\21\3\21\3\22\3\22\3\22\3\22\3\22\3\23\3\23\3\23\3\23\3\24\3\24\3\25\6"+
		"\25\u009e\n\25\r\25\16\25\u009f\3\25\3\25\2\2\26\3\3\5\4\7\5\t\6\13\7"+
		"\r\b\17\t\21\n\23\2\25\13\27\f\31\r\33\16\35\17\37\20!\21#\22%\23\'\24"+
		")\25\3\2\6\3\2\62;\5\2:;CDcd\5\2\62;CHch\5\2\13\f\17\17\"\"\2\u00ae\2"+
		"\3\3\2\2\2\2\5\3\2\2\2\2\7\3\2\2\2\2\t\3\2\2\2\2\13\3\2\2\2\2\r\3\2\2"+
		"\2\2\17\3\2\2\2\2\21\3\2\2\2\2\25\3\2\2\2\2\27\3\2\2\2\2\31\3\2\2\2\2"+
		"\33\3\2\2\2\2\35\3\2\2\2\2\37\3\2\2\2\2!\3\2\2\2\2#\3\2\2\2\2%\3\2\2\2"+
		"\2\'\3\2\2\2\2)\3\2\2\2\3+\3\2\2\2\5-\3\2\2\2\7/\3\2\2\2\t\61\3\2\2\2"+
		"\13\63\3\2\2\2\r\65\3\2\2\2\17\67\3\2\2\2\219\3\2\2\2\23;\3\2\2\2\25>"+
		"\3\2\2\2\27P\3\2\2\2\31t\3\2\2\2\33v\3\2\2\2\35z\3\2\2\2\37\u008a\3\2"+
		"\2\2!\u008e\3\2\2\2#\u0091\3\2\2\2%\u0096\3\2\2\2\'\u009a\3\2\2\2)\u009d"+
		"\3\2\2\2+,\7*\2\2,\4\3\2\2\2-.\7+\2\2.\6\3\2\2\2/\60\7.\2\2\60\b\3\2\2"+
		"\2\61\62\7`\2\2\62\n\3\2\2\2\63\64\7,\2\2\64\f\3\2\2\2\65\66\7\61\2\2"+
		"\66\16\3\2\2\2\678\7-\2\28\20\3\2\2\29:\7/\2\2:\22\3\2\2\2;<\t\2\2\2<"+
		"\24\3\2\2\2=?\7/\2\2>=\3\2\2\2>?\3\2\2\2?A\3\2\2\2@B\5\23\n\2A@\3\2\2"+
		"\2BC\3\2\2\2CA\3\2\2\2CD\3\2\2\2DK\3\2\2\2EG\7\60\2\2FH\5\23\n\2GF\3\2"+
		"\2\2HI\3\2\2\2IG\3\2\2\2IJ\3\2\2\2JL\3\2\2\2KE\3\2\2\2KL\3\2\2\2L\26\3"+
		"\2\2\2MN\7R\2\2NQ\7K\2\2OQ\7G\2\2PM\3\2\2\2PO\3\2\2\2Q\30\3\2\2\2RS\7"+
		"u\2\2ST\7k\2\2Tu\7p\2\2UV\7e\2\2VW\7q\2\2Wu\7u\2\2XY\7v\2\2YZ\7c\2\2Z"+
		"u\7p\2\2[\\\7c\2\2\\]\7t\2\2]^\7e\2\2^_\7u\2\2_`\7k\2\2`u\7p\2\2ab\7c"+
		"\2\2bc\7t\2\2cd\7e\2\2de\7e\2\2ef\7q\2\2fu\7u\2\2gh\7c\2\2hi\7t\2\2ij"+
		"\7e\2\2jk\7v\2\2kl\7c\2\2lu\7p\2\2mn\7n\2\2no\7q\2\2op\7i\2\2pq\7\63\2"+
		"\2qu\7\62\2\2rs\7n\2\2su\7p\2\2tR\3\2\2\2tU\3\2\2\2tX\3\2\2\2t[\3\2\2"+
		"\2ta\3\2\2\2tg\3\2\2\2tm\3\2\2\2tr\3\2\2\2u\32\3\2\2\2vw\7n\2\2wx\7q\2"+
		"\2xy\7i\2\2y\34\3\2\2\2z{\7B\2\2{|\7B\2\2|}\3\2\2\2}~\5!\21\2~\177\7/"+
		"\2\2\177\u0080\5#\22\2\u0080\u0081\7/\2\2\u0081\u0082\7\66\2\2\u0082\u0083"+
		"\3\2\2\2\u0083\u0084\5%\23\2\u0084\u0085\7/\2\2\u0085\u0086\t\3\2\2\u0086"+
		"\u0087\5%\23\2\u0087\u0088\7/\2\2\u0088\u0089\5\37\20\2\u0089\36\3\2\2"+
		"\2\u008a\u008b\5#\22\2\u008b\u008c\5#\22\2\u008c\u008d\5#\22\2\u008d "+
		"\3\2\2\2\u008e\u008f\5#\22\2\u008f\u0090\5#\22\2\u0090\"\3\2\2\2\u0091"+
		"\u0092\5\'\24\2\u0092\u0093\5\'\24\2\u0093\u0094\5\'\24\2\u0094\u0095"+
		"\5\'\24\2\u0095$\3\2\2\2\u0096\u0097\5\'\24\2\u0097\u0098\5\'\24\2\u0098"+
		"\u0099\5\'\24\2\u0099&\3\2\2\2\u009a\u009b\t\4\2\2\u009b(\3\2\2\2\u009c"+
		"\u009e\t\5\2\2\u009d\u009c\3\2\2\2\u009e\u009f\3\2\2\2\u009f\u009d\3\2"+
		"\2\2\u009f\u00a0\3\2\2\2\u00a0\u00a1\3\2\2\2\u00a1\u00a2\b\25\2\2\u00a2"+
		"*\3\2\2\2\n\2>CIKPt\u009f\3\2\3\2";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}