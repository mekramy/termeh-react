import { describe, expect, it } from "vitest";
import { isValidIranianMobile } from "../../packages/validation/methods";

describe("isValidIranianMobile", () => {
    it("returns true for valid Iranian mobile numbers", () => {
        expect(isValidIranianMobile("09123456789")).toBe(true);
        expect(isValidIranianMobile("09987654321")).toBe(true);
    });

    it("returns true for empty values", () => {
        expect(isValidIranianMobile("")).toBe(true);
        expect(isValidIranianMobile(undefined)).toBe(true);
    });

    it("returns false for invalid or malformed numbers", () => {
        expect(isValidIranianMobile("9123456789")).toBe(false);
        expect(isValidIranianMobile("0912345678")).toBe(false);
    });
});
