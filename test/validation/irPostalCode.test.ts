import { describe, expect, it } from "vitest";
import { isValidIranianPostalCode } from "../../packages/form/methods";

describe("isValidIranianPostalCode", () => {
    it("returns true for valid postal codes", () => {
        expect(isValidIranianPostalCode("1234567890")).toBe(true);
        expect(isValidIranianPostalCode("9876543210")).toBe(true);
    });

    it("returns true for empty values", () => {
        expect(isValidIranianPostalCode("")).toBe(true);
        expect(isValidIranianPostalCode(undefined)).toBe(true);
    });

    it("returns false for invalid or malformed codes", () => {
        expect(isValidIranianPostalCode("123456789")).toBe(false);
        expect(isValidIranianPostalCode("abcdefghij")).toBe(false);
    });
});
