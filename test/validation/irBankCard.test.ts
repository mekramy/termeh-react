import { describe, expect, it } from "vitest";
import { isValidIranianBankCard } from "../../packages/form/methods";

describe("isValidIranianBankCard", () => {
    it("returns true for valid Iranian bank card numbers", () => {
        expect(isValidIranianBankCard("6219-8619-1964-4475")).toBe(true);
        expect(isValidIranianBankCard("5047061067907960")).toBe(true);
    });

    it("returns true for empty values", () => {
        expect(isValidIranianBankCard("")).toBe(true);
        expect(isValidIranianBankCard(undefined)).toBe(true);
    });

    it("returns false for invalid or malformed numbers", () => {
        expect(isValidIranianBankCard("6037991459023407")).toBe(false);
        expect(isValidIranianBankCard("1234567890123456")).toBe(false);
    });
});
