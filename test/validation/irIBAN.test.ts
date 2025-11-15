import { describe, expect, it } from "vitest";
import { isValidIranianIBAN } from "../../packages/form/methods";

describe("isValidIranianIBAN", () => {
    it("returns true for valid IBANs", () => {
        expect(isValidIranianIBAN("IR47 0120 0200 0000 9978 9632 69")).toBe(
            true
        );
        expect(isValidIranianIBAN("610610000000100845521649")).toBe(true); // without IR
    });

    it("returns true for empty values", () => {
        expect(isValidIranianIBAN("")).toBe(true);
        expect(isValidIranianIBAN(undefined)).toBe(true);
    });

    it("returns false for invalid IBANs", () => {
        expect(isValidIranianIBAN("IR000000000000000000000000")).toBe(false);
    });
});
