// Generated from /Users/ajp/projects/DataCurator/app/frontend/src/x_equations/datacurator_grammar.g4 by ANTLR 4.13.1
import org.antlr.v4.runtime.Lexer;
import org.antlr.v4.runtime.CharStream;
import org.antlr.v4.runtime.Token;
import org.antlr.v4.runtime.TokenStream;
import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.atn.*;
import org.antlr.v4.runtime.dfa.DFA;
import org.antlr.v4.runtime.misc.*;

@SuppressWarnings({"all", "warnings", "unchecked", "unused", "cast", "CheckReturnValue", "this-escape"})
public class datacurator_grammarLexer extends Lexer {
	static { RuntimeMetaData.checkVersion("4.13.1", RuntimeMetaData.VERSION); }

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
		"\u0004\u0000\u0013\u00a1\u0006\uffff\uffff\u0002\u0000\u0007\u0000\u0002"+
		"\u0001\u0007\u0001\u0002\u0002\u0007\u0002\u0002\u0003\u0007\u0003\u0002"+
		"\u0004\u0007\u0004\u0002\u0005\u0007\u0005\u0002\u0006\u0007\u0006\u0002"+
		"\u0007\u0007\u0007\u0002\b\u0007\b\u0002\t\u0007\t\u0002\n\u0007\n\u0002"+
		"\u000b\u0007\u000b\u0002\f\u0007\f\u0002\r\u0007\r\u0002\u000e\u0007\u000e"+
		"\u0002\u000f\u0007\u000f\u0002\u0010\u0007\u0010\u0002\u0011\u0007\u0011"+
		"\u0002\u0012\u0007\u0012\u0002\u0013\u0007\u0013\u0001\u0000\u0001\u0000"+
		"\u0001\u0001\u0001\u0001\u0001\u0002\u0001\u0002\u0001\u0003\u0001\u0003"+
		"\u0001\u0004\u0001\u0004\u0001\u0005\u0001\u0005\u0001\u0006\u0001\u0006"+
		"\u0001\u0007\u0001\u0007\u0001\b\u0001\b\u0001\t\u0003\t=\b\t\u0001\t"+
		"\u0004\t@\b\t\u000b\t\f\tA\u0001\t\u0001\t\u0004\tF\b\t\u000b\t\f\tG\u0003"+
		"\tJ\b\t\u0001\n\u0001\n\u0001\n\u0003\nO\b\n\u0001\u000b\u0001\u000b\u0001"+
		"\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001"+
		"\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001"+
		"\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001"+
		"\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001"+
		"\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001"+
		"\u000b\u0001\u000b\u0003\u000bs\b\u000b\u0001\f\u0001\f\u0001\f\u0001"+
		"\f\u0001\r\u0001\r\u0001\r\u0001\r\u0001\r\u0001\r\u0001\r\u0001\r\u0001"+
		"\r\u0001\r\u0001\r\u0001\r\u0001\r\u0001\r\u0001\r\u0001\r\u0001\u000e"+
		"\u0001\u000e\u0001\u000e\u0001\u000e\u0001\u000f\u0001\u000f\u0001\u000f"+
		"\u0001\u0010\u0001\u0010\u0001\u0010\u0001\u0010\u0001\u0010\u0001\u0011"+
		"\u0001\u0011\u0001\u0011\u0001\u0011\u0001\u0012\u0001\u0012\u0001\u0013"+
		"\u0004\u0013\u009c\b\u0013\u000b\u0013\f\u0013\u009d\u0001\u0013\u0001"+
		"\u0013\u0000\u0000\u0014\u0001\u0001\u0003\u0002\u0005\u0003\u0007\u0004"+
		"\t\u0005\u000b\u0006\r\u0007\u000f\b\u0011\u0000\u0013\t\u0015\n\u0017"+
		"\u000b\u0019\f\u001b\r\u001d\u000e\u001f\u000f!\u0010#\u0011%\u0012\'"+
		"\u0013\u0001\u0000\u0004\u0001\u000009\u0003\u000089ABab\u0003\u00000"+
		"9AFaf\u0003\u0000\t\n\r\r  \u00ac\u0000\u0001\u0001\u0000\u0000\u0000"+
		"\u0000\u0003\u0001\u0000\u0000\u0000\u0000\u0005\u0001\u0000\u0000\u0000"+
		"\u0000\u0007\u0001\u0000\u0000\u0000\u0000\t\u0001\u0000\u0000\u0000\u0000"+
		"\u000b\u0001\u0000\u0000\u0000\u0000\r\u0001\u0000\u0000\u0000\u0000\u000f"+
		"\u0001\u0000\u0000\u0000\u0000\u0013\u0001\u0000\u0000\u0000\u0000\u0015"+
		"\u0001\u0000\u0000\u0000\u0000\u0017\u0001\u0000\u0000\u0000\u0000\u0019"+
		"\u0001\u0000\u0000\u0000\u0000\u001b\u0001\u0000\u0000\u0000\u0000\u001d"+
		"\u0001\u0000\u0000\u0000\u0000\u001f\u0001\u0000\u0000\u0000\u0000!\u0001"+
		"\u0000\u0000\u0000\u0000#\u0001\u0000\u0000\u0000\u0000%\u0001\u0000\u0000"+
		"\u0000\u0000\'\u0001\u0000\u0000\u0000\u0001)\u0001\u0000\u0000\u0000"+
		"\u0003+\u0001\u0000\u0000\u0000\u0005-\u0001\u0000\u0000\u0000\u0007/"+
		"\u0001\u0000\u0000\u0000\t1\u0001\u0000\u0000\u0000\u000b3\u0001\u0000"+
		"\u0000\u0000\r5\u0001\u0000\u0000\u0000\u000f7\u0001\u0000\u0000\u0000"+
		"\u00119\u0001\u0000\u0000\u0000\u0013<\u0001\u0000\u0000\u0000\u0015N"+
		"\u0001\u0000\u0000\u0000\u0017r\u0001\u0000\u0000\u0000\u0019t\u0001\u0000"+
		"\u0000\u0000\u001bx\u0001\u0000\u0000\u0000\u001d\u0088\u0001\u0000\u0000"+
		"\u0000\u001f\u008c\u0001\u0000\u0000\u0000!\u008f\u0001\u0000\u0000\u0000"+
		"#\u0094\u0001\u0000\u0000\u0000%\u0098\u0001\u0000\u0000\u0000\'\u009b"+
		"\u0001\u0000\u0000\u0000)*\u0005(\u0000\u0000*\u0002\u0001\u0000\u0000"+
		"\u0000+,\u0005)\u0000\u0000,\u0004\u0001\u0000\u0000\u0000-.\u0005,\u0000"+
		"\u0000.\u0006\u0001\u0000\u0000\u0000/0\u0005^\u0000\u00000\b\u0001\u0000"+
		"\u0000\u000012\u0005*\u0000\u00002\n\u0001\u0000\u0000\u000034\u0005/"+
		"\u0000\u00004\f\u0001\u0000\u0000\u000056\u0005+\u0000\u00006\u000e\u0001"+
		"\u0000\u0000\u000078\u0005-\u0000\u00008\u0010\u0001\u0000\u0000\u0000"+
		"9:\u0007\u0000\u0000\u0000:\u0012\u0001\u0000\u0000\u0000;=\u0005-\u0000"+
		"\u0000<;\u0001\u0000\u0000\u0000<=\u0001\u0000\u0000\u0000=?\u0001\u0000"+
		"\u0000\u0000>@\u0003\u0011\b\u0000?>\u0001\u0000\u0000\u0000@A\u0001\u0000"+
		"\u0000\u0000A?\u0001\u0000\u0000\u0000AB\u0001\u0000\u0000\u0000BI\u0001"+
		"\u0000\u0000\u0000CE\u0005.\u0000\u0000DF\u0003\u0011\b\u0000ED\u0001"+
		"\u0000\u0000\u0000FG\u0001\u0000\u0000\u0000GE\u0001\u0000\u0000\u0000"+
		"GH\u0001\u0000\u0000\u0000HJ\u0001\u0000\u0000\u0000IC\u0001\u0000\u0000"+
		"\u0000IJ\u0001\u0000\u0000\u0000J\u0014\u0001\u0000\u0000\u0000KL\u0005"+
		"P\u0000\u0000LO\u0005I\u0000\u0000MO\u0005E\u0000\u0000NK\u0001\u0000"+
		"\u0000\u0000NM\u0001\u0000\u0000\u0000O\u0016\u0001\u0000\u0000\u0000"+
		"PQ\u0005s\u0000\u0000QR\u0005i\u0000\u0000Rs\u0005n\u0000\u0000ST\u0005"+
		"c\u0000\u0000TU\u0005o\u0000\u0000Us\u0005s\u0000\u0000VW\u0005t\u0000"+
		"\u0000WX\u0005a\u0000\u0000Xs\u0005n\u0000\u0000YZ\u0005a\u0000\u0000"+
		"Z[\u0005r\u0000\u0000[\\\u0005c\u0000\u0000\\]\u0005s\u0000\u0000]^\u0005"+
		"i\u0000\u0000^s\u0005n\u0000\u0000_`\u0005a\u0000\u0000`a\u0005r\u0000"+
		"\u0000ab\u0005c\u0000\u0000bc\u0005c\u0000\u0000cd\u0005o\u0000\u0000"+
		"ds\u0005s\u0000\u0000ef\u0005a\u0000\u0000fg\u0005r\u0000\u0000gh\u0005"+
		"c\u0000\u0000hi\u0005t\u0000\u0000ij\u0005a\u0000\u0000js\u0005n\u0000"+
		"\u0000kl\u0005l\u0000\u0000lm\u0005o\u0000\u0000mn\u0005g\u0000\u0000"+
		"no\u00051\u0000\u0000os\u00050\u0000\u0000pq\u0005l\u0000\u0000qs\u0005"+
		"n\u0000\u0000rP\u0001\u0000\u0000\u0000rS\u0001\u0000\u0000\u0000rV\u0001"+
		"\u0000\u0000\u0000rY\u0001\u0000\u0000\u0000r_\u0001\u0000\u0000\u0000"+
		"re\u0001\u0000\u0000\u0000rk\u0001\u0000\u0000\u0000rp\u0001\u0000\u0000"+
		"\u0000s\u0018\u0001\u0000\u0000\u0000tu\u0005l\u0000\u0000uv\u0005o\u0000"+
		"\u0000vw\u0005g\u0000\u0000w\u001a\u0001\u0000\u0000\u0000xy\u0005@\u0000"+
		"\u0000yz\u0005@\u0000\u0000z{\u0001\u0000\u0000\u0000{|\u0003\u001f\u000f"+
		"\u0000|}\u0005-\u0000\u0000}~\u0003!\u0010\u0000~\u007f\u0005-\u0000\u0000"+
		"\u007f\u0080\u00054\u0000\u0000\u0080\u0081\u0001\u0000\u0000\u0000\u0081"+
		"\u0082\u0003#\u0011\u0000\u0082\u0083\u0005-\u0000\u0000\u0083\u0084\u0007"+
		"\u0001\u0000\u0000\u0084\u0085\u0003#\u0011\u0000\u0085\u0086\u0005-\u0000"+
		"\u0000\u0086\u0087\u0003\u001d\u000e\u0000\u0087\u001c\u0001\u0000\u0000"+
		"\u0000\u0088\u0089\u0003!\u0010\u0000\u0089\u008a\u0003!\u0010\u0000\u008a"+
		"\u008b\u0003!\u0010\u0000\u008b\u001e\u0001\u0000\u0000\u0000\u008c\u008d"+
		"\u0003!\u0010\u0000\u008d\u008e\u0003!\u0010\u0000\u008e \u0001\u0000"+
		"\u0000\u0000\u008f\u0090\u0003%\u0012\u0000\u0090\u0091\u0003%\u0012\u0000"+
		"\u0091\u0092\u0003%\u0012\u0000\u0092\u0093\u0003%\u0012\u0000\u0093\""+
		"\u0001\u0000\u0000\u0000\u0094\u0095\u0003%\u0012\u0000\u0095\u0096\u0003"+
		"%\u0012\u0000\u0096\u0097\u0003%\u0012\u0000\u0097$\u0001\u0000\u0000"+
		"\u0000\u0098\u0099\u0007\u0002\u0000\u0000\u0099&\u0001\u0000\u0000\u0000"+
		"\u009a\u009c\u0007\u0003\u0000\u0000\u009b\u009a\u0001\u0000\u0000\u0000"+
		"\u009c\u009d\u0001\u0000\u0000\u0000\u009d\u009b\u0001\u0000\u0000\u0000"+
		"\u009d\u009e\u0001\u0000\u0000\u0000\u009e\u009f\u0001\u0000\u0000\u0000"+
		"\u009f\u00a0\u0006\u0013\u0000\u0000\u00a0(\u0001\u0000\u0000\u0000\b"+
		"\u0000<AGINr\u009d\u0001\u0000\u0001\u0000";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}