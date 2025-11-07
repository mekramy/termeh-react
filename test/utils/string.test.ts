import { describe, expect, it } from "vitest";
import {
    concat,
    mapValue,
    slugify,
    slugifyUnicode,
    truncate,
} from "../../packages/utils";

describe("concat", () => {
    it("concatenates non-empty items", () => {
        expect(concat("a", "b", "c")).toBe("a b c");
        expect(concat("a", "", "b")).toBe("a b");
        expect(concat("a", null, "b")).toBe("a b");
        expect(concat("a", undefined, "b")).toBe("a b");
        expect(concat("a", NaN, "b")).toBe("a b");
    });
    it("returns empty string for all empty", () => {
        expect(concat("", null, undefined, NaN)).toBe("");
    });
});

describe("truncate", () => {
    it("truncates long string", () => {
        expect(truncate("abcdef", 3)).toBe("abc...");
        expect(truncate("abcdef", 6)).toBe("abcdef");
        expect(truncate("abcdef", 0)).toBe("");
    });
});

describe("slugify", () => {
    it("slugifies strings", () => {
        expect(slugify("-", "Hello World!")).toBe("hello-world");
        expect(slugify("_", "Foo Bar", "Baz")).toBe("foo_bar_baz");
        expect(slugify("-", "  Foo  ", "Bar")).toBe("foo-bar");
        expect(slugify("-", "", "Bar")).toBe("bar");
    });
});

describe("slugifyUnicode", () => {
    it("slugifies unicode strings", () => {
        expect(slugifyUnicode("-", "سلام دنیا")).toBe("سلام-دنیا");
        expect(slugifyUnicode("_", "  Foo  ", "بار")).toBe("Foo_بار");
        expect(slugifyUnicode("-", "", "بار")).toBe("بار");
    });
});

describe("mapValue", () => {
    it("maps value if present", () => {
        expect(mapValue("a", { a: "A", b: "B" })).toBe("A");
        expect(mapValue("b", { a: "A", b: "B" })).toBe("B");
    });
    it("returns wildcard if not present", () => {
        expect(mapValue("c", { "*": "X" })).toBe("X");
    });
    it("returns original if not present and no wildcard", () => {
        expect(mapValue("c", { a: "A" })).toBe("c");
    });
});
