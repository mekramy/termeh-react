import { describe, expect, it } from "vitest";
import { isAlphaNumeric } from "../../packages/validation/methods";

describe("isAlphaNumeric", () => {
    it("returns true for alphanumeric strings", () => {
        expect(isAlphaNumeric("")).toBe(true);
        expect(isAlphaNumeric(undefined)).toBe(true);
        expect(isAlphaNumeric("abc123")).toBe(true);
        expect(isAlphaNumeric("A1B2C3")).toBe(true);
        expect(isAlphaNumeric("abc123_", ["_"])).toBe(true);
        expect(isAlphaNumeric("abc-123", ["-"])).toBe(true);
    });

    it("returns true for empty values", () => {
        expect(isAlphaNumeric("abc 123")).toBe(false);
        expect(isAlphaNumeric("abc@123")).toBe(false);
    });

    it("returns false for strings with invalid chars", () => {
        expect(isAlphaNumeric("abc 123")).toBe(false);
        expect(isAlphaNumeric("abc@123")).toBe(false);
    });
});
