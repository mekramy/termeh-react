import { describe, expect, it } from "vitest";
import { isValidFileSize } from "../../packages/form/methods";

describe("isValidFileSize", () => {
    function makeFile(size: number): File {
        return new File(["a".repeat(size)], "test.txt");
    }

    it("returns true for file within range", () => {
        expect(isValidFileSize(makeFile(100), 50, 200)).toBe(true);
        expect(isValidFileSize(makeFile(0), 0, 10)).toBe(true);
        expect(isValidFileSize(makeFile(10), 0, 10)).toBe(true);
    });

    it("returns true for empty values", () => {
        expect(isValidFileSize(undefined, 0, 10)).toBe(true);
    });

    it("returns false for file out of range", () => {
        expect(isValidFileSize(makeFile(10), 20, 30)).toBe(false);
        expect(isValidFileSize(makeFile(100), 0, 50)).toBe(false);
    });
});
