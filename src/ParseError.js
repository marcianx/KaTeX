// @flow
import ParseNode from "./ParseNode";
import {Token} from "./Token";

/**
 * This is the ParseError class, which is the main error thrown by KaTeX
 * functions when something has gone wrong. This is used to distinguish internal
 * errors from errors in the expression that the user provided.
 *
 * If possible, a caller should provide a Token or ParseNode with information
 * about where in the source string the problem occurred.
 */
class ParseError {
    position: number|void; // Error position based on passed-in Token or ParseNode.

    constructor(
        message: string,         // The error message
        token?: Token|ParseNode, // An object providing position information
    ) {
        let error = "KaTeX parse error: " + message;
        let start;
        let end;

        if (token && token.lexer && token.start <= token.end) {
            // If we have the input and a position, make the error a bit fancier

            // Get the input
            const input = token.lexer.input;

            // Prepend some information
            start = token.start;
            end = token.end;
            if (start === input.length) {
                error += " at end of input: ";
            } else {
                error += " at position " + (start + 1) + ": ";
            }

            // Underline token in question using combining underscores
            const underlined = input.slice(start, end).replace(/[^]/g, "$&\u0332");

            // Extract some context from the input and add it to the error
            let left;
            if (start > 15) {
                left = "…" + input.slice(start - 15, start);
            } else {
                left = input.slice(0, start);
            }
            let right;
            if (end + 15 < input.length) {
                right = input.slice(end, end + 15) + "…";
            } else {
                right = input.slice(end);
            }
            error += left + underlined + right;
        }

        // Some hackery to make ParseError a prototype of Error
        // See http://stackoverflow.com/a/8460753
        const self = new Error(error);
        self.name = "ParseError";
        self.__proto__ = ParseError.prototype;

        self.position = start;
        return self;
    }
}

// More hackery
ParseError.prototype.__proto__ = Error.prototype;

module.exports = ParseError;
