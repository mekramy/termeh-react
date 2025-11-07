import moment from "moment-jalaali";
import { describe, expect, it } from "vitest";
import {
    ago,
    humanize,
    parse,
    parseFrom,
    parseRFC3339,
    toHMS,
} from "../../packages/utils";

describe("parse", () => {
    it("parses valid date", () => {
        const m = parse("2023-10-05");
        expect(m.isValid()).toBe(true);
        expect(m.year()).toBe(2023);
        expect(m.month()).toBe(9); // October is month 9 (0-based)
        expect(m.date()).toBe(5);
    });
    it("returns invalid for nonsense", () => {
        expect(parse("not-a-date").isValid()).toBe(false);
    });
});

describe("parseRFC3339", () => {
    it("parses RFC3339 date", () => {
        const m = parseRFC3339("2023-10-05T12:30:45Z").utc();
        expect(m.isValid()).toBe(true);
        expect(m.year()).toBe(2023);
        expect(m.hour()).toBe(12);
        expect(m.minute()).toBe(30);
        expect(m.second()).toBe(45);
    });
    it("returns invalid for bad format", () => {
        expect(parseRFC3339("bad-format").isValid()).toBe(false);
    });
});

describe("parseFrom", () => {
    it("parses custom format", () => {
        const m = parseFrom("YYYY-MM-DD", "2023-10-05");
        expect(m.isValid()).toBe(true);
        expect(m.year()).toBe(2023);
        expect(m.month()).toBe(9);
        expect(m.date()).toBe(5);
    });
    it("parses Jalali format", () => {
        const m = parseFrom("jYYYY/jMM/jDD", "1402/07/13");
        expect(m.isValid()).toBe(true);
        expect(m.format("jYYYY-jMM-jDD")).toBe("1402-07-13");
    });
});

describe("ago", () => {
    it("returns humanized time difference in fa", () => {
        const now = moment();
        expect(ago(now, "fa")).toContain("پیش");
    });
    it("returns humanized time difference in en", () => {
        const now = moment();
        expect(ago(now, "en")).toContain("ago");
    });
    it("returns empty string for invalid date", () => {
        expect(ago("not-a-date")).toBe("");
    });
});

describe("toHMS", () => {
    it("converts seconds to h:m:s", () => {
        expect(toHMS(3661)).toEqual({ hours: 1, minutes: 1, seconds: 1 });
    });
    it("converts milliseconds to h:m:s", () => {
        expect(toHMS(3661000, "milliseconds")).toEqual({
            hours: 1,
            minutes: 1,
            seconds: 1,
        });
    });
    it("handles negative durations", () => {
        expect(toHMS(-3661)).toEqual({ hours: 1, minutes: 1, seconds: 1 });
    });
});

describe("humanize", () => {
    it("humanizes duration in fa", () => {
        expect(humanize(3661000, "milliseconds", "fa")).toContain("ساعت");
        expect(humanize(3661000, "milliseconds", "fa")).toContain("دقیقه");
    });
    it("humanizes duration in en", () => {
        expect(humanize(3661000, "milliseconds", "en")).toContain("hour");
        expect(humanize(3661000, "milliseconds", "en")).toContain("minute");
    });
    it("returns zero seconds for zero duration", () => {
        expect(humanize(0, "milliseconds", "en")).toBe("0 seconds");
        expect(humanize(0, "milliseconds", "fa")).toContain("0 ثانیه");
    });
});
