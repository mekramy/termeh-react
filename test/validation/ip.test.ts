import { describe, expect, it } from "vitest";
import { isValidIP } from "../../packages/form/methods";

describe("isValidIP", () => {
    it("returns true for valid IPv4", () => {
        expect(isValidIP("192.168.1.1")).toBe(true);
        expect(isValidIP("255.255.255.255")).toBe(true);
        expect(isValidIP("0.0.0.0")).toBe(true);
    });

    it("returns true for valid IPv6", () => {
        expect(isValidIP("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe(true);
        expect(isValidIP("::1")).toBe(true);
    });

    it("returns true for empty values", () => {
        expect(isValidIP("")).toBe(true);
        expect(isValidIP(undefined)).toBe(true);
    });

    it("returns false for invalid IPs", () => {
        expect(isValidIP("256.256.256.256")).toBe(false);
        expect(isValidIP("123.456.78.90")).toBe(false);
    });
});
