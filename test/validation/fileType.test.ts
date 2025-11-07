import { describe, expect, it } from "vitest";
import { isValidFileType } from "../../packages/validation/methods";

describe("isValidFileType", () => {
    function makeFile(type: string): File {
        return new File(["a"], "test.txt", { type });
    }

    it("returns true for allowed MIME types", () => {
        expect(isValidFileType(makeFile("image/png"), ["image/png"])).toBe(
            true
        );
        expect(
            isValidFileType(makeFile("text/plain"), ["text/plain", "image/png"])
        ).toBe(true);
    });

    it("returns true for empty values", () => {
        expect(isValidFileType(undefined, ["image/png"])).toBe(true);
    });

    it("returns false for disallowed MIME types", () => {
        expect(isValidFileType(makeFile("image/jpeg"), ["image/png"])).toBe(
            false
        );
    });
});
