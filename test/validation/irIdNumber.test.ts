import { describe, expect, it } from "vitest";
import { isValidIranianIdNumber } from "../../packages/form/methods";

describe("isValidIranianIdNumber", () => {
    it("returns true for valid ID numbers", () => {
        expect(isValidIranianIdNumber("1234567890")).toBe(true);
        expect(isValidIranianIdNumber("1")).toBe(true);
    });

    it("returns true for empty values", () => {
        expect(isValidIranianIdNumber("")).toBe(true);
        expect(isValidIranianIdNumber(undefined)).toBe(true);
    });

    it("returns false for invalid or malformed numbers", () => {
        expect(isValidIranianIdNumber("12345678901")).toBe(false);
        expect(isValidIranianIdNumber("abc")).toBe(false);
    });
});
