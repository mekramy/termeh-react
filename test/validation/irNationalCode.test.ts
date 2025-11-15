import { describe, expect, it } from "vitest";
import { isValidIranianNationalCode } from "../../packages/form/methods";

describe("isValidIranianNationalCode", () => {
    it("returns true for valid national codes", () => {
        expect(isValidIranianNationalCode("0013520849")).toBe(true);
        expect(isValidIranianNationalCode("0084575948")).toBe(true);
    });

    it("returns true for empty values", () => {
        expect(isValidIranianNationalCode("")).toBe(true);
        expect(isValidIranianNationalCode(undefined)).toBe(true);
    });

    it("returns false for invalid or malformed codes", () => {
        expect(isValidIranianNationalCode("0013520840")).toBe(false);
        expect(isValidIranianNationalCode("123456789")).toBe(false);
    });
});
