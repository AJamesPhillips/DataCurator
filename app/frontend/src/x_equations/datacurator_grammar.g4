grammar datacurator_grammar;

/* This will be the entry point of our parser. */
equation
    :   expression* EOF;


/*
 * Adapted from: https://github.com/arothuis/antlr4-calculator/blob/5959a0/src/main/antlr4/nl/arothuis/antlr4calculator/core/parser/Calculator.g4
 *
 * The order in which expressions are evaluated
 * is determined by the order in which possible
 * matching rules are defined.
 * Here, numbers are dealt with first, then parentheses
 * and so on.
 *
 * Multiplication and division are on the
 * same precedence level, so they are grouped.
 * The same goes for addition and subtraction.
 *
 * Labels (e.g. "# Parentheses") are added to each rule
 * to provide context to which rule is being parsed.
 * This is can be used in a Listener or Visitor
 * to allow for separate control over Listener or Visitor actions.
 *
 * Likewise, inner labels (e.g. "left=expression")
 * can be added to child nodes of the rule.
 * This makes them identifiable in a
 * Listener's or Visitor's parsing of the rule,
 * allowing for even more fine-grained control.
 */
expression
    :   NUMBER                                               # Number
    |   ID_REF                                               # IDRef
    |   '(' inner=expression ')'                             # Parentheses
    |   arg_funktion=ARG2_FUNKTION '(' arg1=expression ',' arg2=expression ')' # FunctionsWith2Args
    |   arg_funktion=ARG_FUNKTION '(' arg1=expression ')'    # FunctionsWithArgs
    |   constants=CONSTANTS                                  # Constants
    |   left=expression operator=POW right=expression        # Power
    |   left=expression (rest_operators+=(MUL|DIV) rest+=subexpression)+  # MultiplicationOrDivision
    |   left=expression (rest_operators+=(ADD|SUB) rest+=subexpression)+  # AdditionOrSubtraction
    ;


// Without using this subexpression in the labeled lists above then an equation
// like `1 + 2 + 3` is parsed as:
//      `1 + [( 2 + 3 )]` instead of:
//      `1 + [( 2 + ), ( 3 + )]`
subexpression
    :   NUMBER
    |   ID_REF
    |   expression
    ;


POW: '^'; // | '**';
MUL: '*';
DIV: '/';
ADD: '+';
SUB: '-';

fragment DIGIT
    :   [0-9]
    ;

/* A number: can be an integer value, or a decimal value */
NUMBER
    :   '-'?DIGIT+ ('.' DIGIT+)?
    ;


CONSTANTS
    : 'PI'
    | 'E'
    ;

ARG_FUNKTION
    : 'sin'
    | 'cos'
    | 'tan'
    | 'arcsin'
    | 'arccos'
    | 'arctan'
    | 'log10'
    | 'ln'
    ;

ARG2_FUNKTION
    : 'log'
    ;


ID_REF: '@@' ID_REF_8CHAR '-' ID_REF_4CHAR '-4' ID_REF_3CHAR '-' [89ABab]ID_REF_3CHAR '-' ID_REF_12CHAR;
// ID_REF: '@@' ID_REF_CHAR;
ID_REF_12CHAR: ID_REF_4CHAR ID_REF_4CHAR ID_REF_4CHAR;
ID_REF_8CHAR: ID_REF_4CHAR ID_REF_4CHAR;
ID_REF_4CHAR: ID_REF_CHAR ID_REF_CHAR ID_REF_CHAR ID_REF_CHAR;
ID_REF_3CHAR: ID_REF_CHAR ID_REF_CHAR ID_REF_CHAR;
ID_REF_CHAR: [0-9A-Fa-f];


/* We're going to ignore all white space characters */
WHITESPACE
    :   [ \r\n\t]+ -> channel(HIDDEN)
    ;
