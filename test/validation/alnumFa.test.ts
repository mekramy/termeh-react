import { describe, expect, it } from "vitest";
import { isAlphaNumericWithPersian } from "../../packages/form/methods";

describe("isAlphaNumericWithPersian", () => {
    it("returns true for English, Persian, and numbers", () => {
        expect(isAlphaNumericWithPersian("abc123")).toBe(true);
        expect(isAlphaNumericWithPersian("۱۲۳۴۵۶۷۸۹۰")).toBe(true); // Persian numbers
        expect(isAlphaNumericWithPersian("سلام123")).toBe(true); // Persian letters
        expect(isAlphaNumericWithPersian("abc_سلام", ["_"])).toBe(true);
    });

    it("returns true for empty values", () => {
        expect(isAlphaNumericWithPersian("")).toBe(true);
        expect(isAlphaNumericWithPersian(undefined)).toBe(true);
    });

    it("returns false for invalid chars", () => {
        expect(isAlphaNumericWithPersian("abc 123")).toBe(false);
        expect(isAlphaNumericWithPersian("سلام!")).toBe(false);
    });
});
