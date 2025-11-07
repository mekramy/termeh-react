import { describe, expect, it } from "vitest";
import { mergeConfig, MergeOptions } from "../../packages/utils";

describe("mergeConfig", () => {
    it("deep merges nested objects by default", () => {
        const base = { a: 1, b: { c: 2, d: 3 } };
        const partial = { b: { c: 10 } };
        const result = mergeConfig(base, partial);
        expect(result).toEqual({ a: 1, b: { c: 10, d: 3 } });
        expect(result).not.toBe(base);
        expect(result.b).not.toBe(base.b);
    });

    it("replaces arrays by default", () => {
        const base = { arr: [1, 2, 3] };
        const partial = { arr: [4, 5] };
        const result = mergeConfig(base, partial);
        expect(result.arr).toEqual([4, 5]);
        expect(result.arr).not.toBe(base.arr);
    });

    it("ignores undefined values with safe strategy", () => {
        const base = { a: 1, b: 2 };
        const partial = { a: undefined };
        const options: MergeOptions = { a: "safe" };
        const result = mergeConfig(base, partial, options);
        expect(result.a).toBe(1);
    });

    it("replaces value with replace strategy", () => {
        const base = { a: 1, b: { c: 2 } };
        const partial = { b: { c: 99 } };
        const options: MergeOptions = { b: "replace" };
        const result = mergeConfig(base, partial, options);
        expect(result.b).toEqual({ c: 99 });
    });

    it("applies strategy to nested paths", () => {
        const base = {
            theme: { colors: { primary: "red", secondary: "blue" } },
        };
        const partial = { theme: { colors: { primary: "green" } } };
        const options: MergeOptions = { "theme.colors.primary": "replace" };
        const result = mergeConfig(base, partial, options);
        expect(result.theme.colors.primary).toBe("green");
        expect(result.theme.colors.secondary).toBe("blue");
    });

    it("does not mutate original objects", () => {
        const base = { a: 1, b: { c: 2 } };
        const partial = { b: { c: 3 } };
        const result = mergeConfig(base, partial);
        expect(result).not.toBe(base);
        expect(result.b).not.toBe(base.b);
    });

    it("handles empty partial config", () => {
        const base = { a: 1, b: 2 };
        const result = mergeConfig(base, {});
        expect(result).toEqual(base);
        expect(result).not.toBe(base);
    });

    it("handles null/undefined in base config", () => {
        const base = { a: null, b: undefined };
        const partial = { a: 1, b: 2 };
        const result = mergeConfig(base, partial as any);
        expect(result).toEqual({ a: 1, b: 2 });
    });

    it("handles non-object values in partial", () => {
        const base = { a: 1, b: { c: 2 } };
        const partial = { b: 5 };
        const result = mergeConfig(base, partial as any);
        expect(result.b).toBe(5);
    });

    it("handles deeply nested safe/replace strategies", () => {
        const base = { a: { b: { c: 1, d: 2 } } };
        const partial = { a: { b: { c: undefined, d: 3 } } };
        const options: MergeOptions = { "a.b.c": "safe", "a.b.d": "replace" };
        const result = mergeConfig(base, partial, options);
        expect(result.a.b.c).toBe(1);
        expect(result.a.b.d).toBe(3);
    });
});
