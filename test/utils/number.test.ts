import { describe, expect, it } from "vitest";
import {
    extractNumeric,
    formatNumber,
    parseNumber,
    unifySeparator,
} from "../../packages/utils";

describe("parseNumber", () => {
    it("parses valid numbers", () => {
        expect(parseNumber("123")).toBe(123);
        expect(parseNumber("  123.45 ")).toBe(123.45);
        expect(parseNumber("-99")).toBe(-99);
        expect(parseNumber("1,234")).toBe(1234);
        expect(parseNumber("1 234")).toBe(1234);
    });
    it("returns NaN for invalid input", () => {
        expect(parseNumber("abc")).toBeNaN();
        expect(parseNumber(null)).toBeNaN();
        expect(parseNumber("")).toBeNaN();
    });
});

describe("extractNumeric", () => {
    it("extracts digits from string", () => {
        expect(extractNumeric("abc123def")).toBe("123");
        expect(extractNumeric("007")).toBe("007");
        expect(extractNumeric("no digits")).toBe("");
        expect(extractNumeric("12.34")).toBe("1234");
    });
    it("returns empty string for null/empty", () => {
        expect(extractNumeric(null)).toBe("");
        expect(extractNumeric("")).toBe("");
    });
});

describe("unifySeparator", () => {
    it("replaces non-numeric chars with separator", () => {
        expect(unifySeparator("1,234.56", "_")).toBe("1_234.56");
        expect(unifySeparator("abc-123", "|")).toBe("|-123");
    });
    it("returns empty string for null", () => {
        expect(unifySeparator(null, ",")).toBe("");
    });
});

describe("formatNumber", () => {
    it("formats number with default separator", () => {
        expect(formatNumber(1234567)).toBe("1,234,567");
        expect(formatNumber("1234567")).toBe("1,234,567");
    });
    it("formats with custom separator", () => {
        expect(formatNumber(1234567, ".")).toBe("1.234.567");
    });
    it("returns empty string for invalid input", () => {
        expect(formatNumber("abc")).toBe("");
    });
});
