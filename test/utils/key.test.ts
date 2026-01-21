import { describe, expect, it } from "vitest";
import { createKey } from "../../packages/utils";

describe("createKey", () => {
    it("generate deep key", () => {
        const a = { b: "c" };
        const c = { d: a };
        expect(
            createKey([
                "a",
                "b",
                "c",
                { z: "x", d: "e", a: { b: "c" } },
                { a, c },
                [5, 3, 4],
            ])
        ).toBe(`a|b|c|{a:{b:c},d:e,z:x}|{a:{b:c},c:{d:[Circular]}}|[5,3,4]`);
    });
});
