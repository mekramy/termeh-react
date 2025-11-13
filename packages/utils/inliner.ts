/**
 * Inliner is a small, chainable builder for generating safe inline HTML
 * snippets. It provides convenience methods for common inline tags and a safe
 * text-escaping helper to prevent HTML injection when inserting untrusted
 * content.
 */
export class Inliner {
    /**
     * Create a new Inliner instance.
     *
     * - This is a convenience factory method that is equivalent to `new
     *   Inliner()`.
     *
     * @returns A new `Inliner` instance.
     */
    static create() {
        return new Inliner();
    }

    /**
     * Internal buffer that stores pieces of HTML to be joined by `render()`.
     * This property is intentionally private and mutated by instance methods.
     */
    private pieces: string[] = [];

    /**
     * Appends raw HTML content to the output without escaping.
     *
     * - Use this only with trusted HTML content. Do NOT pass untrusted user input
     *   to this method as it may lead to XSS vulnerabilities.
     *
     * @param content - Trusted HTML string to append as-is.
     * @returns The same `Inliner` instance for chaining.
     */
    raw(content: string): Inliner {
        this.pieces.push(content);
        return this;
    }

    /**
     * Appends text content to the output with HTML escaping applied.
     *
     * - This method is safe for untrusted input because it escapes special
     *   characters used in HTML.
     *
     * @param content - The text content to escape and append.
     * @returns The same `Inliner` instance for chaining.
     */
    text(content: string): Inliner {
        this.pieces.push(escape(content));
        return this;
    }

    /**
     * Appends a `<strong>` element with escaped inner text.
     *
     * - Use for semantic strong emphasis.
     *
     * @param content - The text content to wrap in `<strong>`.
     * @returns The same `Inliner` instance for chaining.
     */
    strong(content: string): Inliner {
        this.pieces.push(`<strong>${escape(content)}</strong>`);
        return this;
    }

    /**
     * Appends an `<em>` element with escaped inner text.
     *
     * - Use for semantic emphasis.
     *
     * @param content - The text content to wrap in `<em>`.
     * @returns The same `Inliner` instance for chaining.
     */
    em(content: string): Inliner {
        this.pieces.push(`<em>${escape(content)}</em>`);
        return this;
    }

    /**
     * Appends a `<u>` element with escaped inner text.
     *
     * - Use for stylistic underline (non-semantic).
     *
     * @param content - The text content to wrap in `<u>`.
     * @returns The same `Inliner` instance for chaining.
     */
    u(content: string): Inliner {
        this.pieces.push(`<u>${escape(content)}</u>`);
        return this;
    }

    /**
     * Appends an `<ins>` element with escaped inner text.
     *
     * - Use for semantic insertion annotation.
     *
     * @param content - The text content to wrap in `<ins>`.
     * @returns The same `Inliner` instance for chaining.
     */
    ins(content: string): Inliner {
        this.pieces.push(`<ins>${escape(content)}</ins>`);
        return this;
    }

    /**
     * Appends an `<s>` element with escaped inner text.
     *
     * - Use for stylistic strikethrough.
     *
     * @param content - The text content to wrap in `<s>`.
     * @returns The same `Inliner` instance for chaining.
     */
    s(content: string): Inliner {
        this.pieces.push(`<s>${escape(content)}</s>`);
        return this;
    }

    /**
     * Appends a `<del>` element with escaped inner text.
     *
     * - Use for semantic deletion annotation.
     *
     * @param content - The text content to wrap in `<del>`.
     * @returns The same `Inliner` instance for chaining.
     */
    del(content: string): Inliner {
        this.pieces.push(`<del>${escape(content)}</del>`);
        return this;
    }

    /**
     * Appends a `<sub>` element with escaped inner text.
     *
     * @param content - The text content to wrap in `<sub>`.
     * @returns The same `Inliner` instance for chaining.
     */
    sub(content: string): Inliner {
        this.pieces.push(`<sub>${escape(content)}</sub>`);
        return this;
    }

    /**
     * Appends a `<sup>` element with escaped inner text.
     *
     * @param content - The text content to wrap in `<sup>`.
     * @returns The same `Inliner` instance for chaining.
     */
    sup(content: string): Inliner {
        this.pieces.push(`<sup>${escape(content)}</sup>`);
        return this;
    }

    /**
     * Appends a generic `<span>` element with escaped inner text.
     *
     * @param content - The text content to wrap in `<span>`.
     * @returns The same `Inliner` instance for chaining.
     */
    span(content: string): Inliner {
        this.pieces.push(`<span>${escape(content)}</span>`);
        return this;
    }

    /**
     * Appends a `<small>` element with escaped inner text.
     *
     * - Useful for side-comments and fine print.
     *
     * @param content - The text content to wrap in `<small>`.
     * @returns The same `Inliner` instance for chaining.
     */
    small(content: string): Inliner {
        this.pieces.push(`<small>${escape(content)}</small>`);
        return this;
    }

    /**
     * Appends a non-breaking space entity (`&nbsp;`) to the output.
     *
     * @returns The same `Inliner` instance for chaining.
     */
    space(): Inliner {
        this.pieces.push("&nbsp;");
        return this;
    }

    /**
     * Returns the generated HTML string by joining all appended pieces.
     *
     * @returns The concatenated HTML string.
     */
    render() {
        return this.pieces.join("");
    }

    /**
     * Alias for `render()` to provide string coercion.
     *
     * @returns The concatenated HTML string.
     */
    toString() {
        return this.render();
    }
}

/**
 * Escapes special characters in text content for safe insertion into HTML.
 *
 * - Replaces characters that have special meaning in HTML with their
 *   corresponding HTML entities.
 *
 * @param s - The string to escape.
 * @returns The escaped string safe for HTML insertion.
 */
function escape(s: string): string {
    return s.replace(/[&<>"'`=/]/g, (ch) => {
        switch (ch) {
            case "&":
                return "&amp;";
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case '"':
                return "&quot;";
            case "'":
                return "&#39;";
            case "`":
                return "&#96;";
            case "=":
                return "&#61;";
            case "/":
                return "&#47;";
            default:
                return ch;
        }
    });
}
