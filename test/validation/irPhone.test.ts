import { describe, expect, it } from "vitest";
import { isValidIranianPhone } from "../../packages/form/methods";

describe("isValidIranianPhone", () => {
    it("returns true for valid Iranian phone numbers", () => {
        expect(isValidIranianPhone("02123456789")).toBe(true);
        expect(isValidIranianPhone("04123456789")).toBe(true);
    });

    it("returns true for empty values", () => {
        expect(isValidIranianPhone("")).toBe(true);
        expect(isValidIranianPhone(undefined)).toBe(true);
    });

    it("returns false for invalid or malformed numbers", () => {
        expect(isValidIranianPhone("1234567890")).toBe(false);
        expect(isValidIranianPhone("0212345678")).toBe(false);
    });
});
