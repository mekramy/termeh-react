import { describe, expect, test } from "vitest";
import { sign, validate } from "../packages/signer/index";

describe("signer", () => {
    test("sign should generate deterministic checksum for same object", async () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { b: 2, a: 1 }; // same keys, different order

        const sig1 = await sign(obj1);
        const sig2 = await sign(obj2);

        expect(sig1).toBe(sig2);
        expect(typeof sig1).toBe("string");
        expect(sig1.length).toBe(64); // SHA-256 hex length
    });

    test("sign should change when object changes", async () => {
        const o1 = { x: 1 };
        const o2 = { x: 2 };

        const s1 = await sign(o1);
        const s2 = await sign(o2);

        expect(s1).not.toBe(s2);
    });

    test("sign should encode nested objects properly", async () => {
        const obj = {
            name: "test",
            nested: { a: 10, b: [1, 2, 3] },
        };

        const result = await sign(obj);

        expect(typeof result).toBe("string");
        expect(result.length).toBe(64);
    });

    test("validate should return true for matching signature", async () => {
        const data = { x: 100, y: [1, 2] };
        const signature = await sign(data);

        const valid = await validate(data, signature);

        expect(valid).toBe(true);
    });

    test("validate should return false for non-matching signature", async () => {
        const data = { x: 100 };
        const sig = "0".repeat(64); // fake signature

        const valid = await validate(data, sig);

        expect(valid).toBe(false);
    });
});
