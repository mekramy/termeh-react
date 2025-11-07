import { describe, expect, it } from "vitest";
import { isValidIPPort } from "../../packages/validation/methods";

describe("isValidIPPort", () => {
    it("returns true for valid IPv4:Port", () => {
        expect(isValidIPPort("127.0.0.1:80")).toBe(true);
        expect(isValidIPPort("192.168.1.1:65535")).toBe(true);
    });

    it("returns true for empty values", () => {
        expect(isValidIPPort("")).toBe(true);
        expect(isValidIPPort(undefined)).toBe(true);
    });

    it("returns false for invalid IP or port", () => {
        expect(isValidIPPort("127.0.0.1:0")).toBe(false);
        expect(isValidIPPort("127.0.0.1:65536")).toBe(false);
        expect(isValidIPPort("256.256.256.256:80")).toBe(false);
        expect(isValidIPPort("127.0.0.1")).toBe(false);
    });
});
