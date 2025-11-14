import moment, { type MomentInput } from "moment-jalaali";

// Initialize moment-jalaali with Persian dialect
moment.loadPersian({ dialect: "persian-modern" });

// Date format constants
export const RFC3339 = "YYYY-MM-DDTHH:mm:ssZ";

// Translation map for humanized duration
type TimeUnit = "years" | "months" | "days" | "hours" | "minutes" | "seconds";
const DURATION_TRANSLATIONS: Record<string, Record<"en" | "fa", string>> = {
    years: { en: "years", fa: "سال" },
    months: { en: "months", fa: "ماه" },
    days: { en: "days", fa: "روز" },
    hours: { en: "hours", fa: "ساعت" },
    minutes: { en: "minutes", fa: "دقیقه" },
    seconds: { en: "seconds", fa: "ثانیه" },
};

/**
 * Parses a standard Gregorian or Jalali date string into a Moment object.
 *
 * - Use `isValid()` on the result to check if parsing succeeded.
 *
 * @param date - The date input to parse (any value accepted by moment).
 * @returns A `moment.Moment` representing the parsed date.
 */
export function parse(date: MomentInput): moment.Moment {
    return moment(date);
}

/**
 * Parses a date string in RFC3339 format into a Moment object.
 *
 * - Parsing is strict relative to the `RFC3339` format constant.
 * - Use `isValid()` on the result to check if parsing succeeded.
 *
 * @param date - The RFC3339 date string to parse (e.g.,
 *   "2023-10-05T12:30:45Z").
 * @returns A `moment.Moment` parsed from the input; `isValid()` indicates
 *   validity.
 */
export function parseRFC3339(date?: string): moment.Moment {
    return moment(date, RFC3339, true);
}

/**
 * Parses a date string according to a provided format string into a Moment
 * object.
 *
 * - For Jalali formats use `j`-prefixed tokens (e.g., "jYYYY/jMM/jDD").
 * - Use `isValid()` on the result to check if parsing succeeded.
 *
 * @param format - The format string describing the expected date format.
 * @param date - The date string to parse using `format`.
 * @returns A `moment.Moment` parsed from the input; `isValid()` indicates
 *   validity.
 */
export function parseFrom(format: string, date?: string): moment.Moment {
    return moment(date, format);
}

/**
 * Returns a human-readable string representing the time difference from now.
 *
 * - Uses moment's `fromNow()` for relative formatting.
 * - If the provided date is invalid, an empty string is returned.
 *
 * @param date - The date to compare against the current time.
 * @param locale - The locale to use for formatting ("en" or "fa"). Defaults to
 *   "en".
 * @returns A localized relative time string (e.g., "2 hours ago" or "۲ ساعت
 *   پیش"), or an empty string when the input date is invalid.
 */
export function ago(date: MomentInput, locale: "en" | "fa" = "en"): string {
    const d = moment(date);
    return d.isValid() ? d.locale(locale).fromNow() : "";
}

/**
 * Converts a numeric duration into hours, minutes, and seconds.
 *
 * - Accepts the duration value in either "milliseconds" or "seconds".
 * - The returned values are absolute (non-negative).
 *
 * @param duration - The duration value to convert.
 * @param unit - The unit of the provided duration ("milliseconds" | "seconds").
 *   Defaults to "seconds".
 * @returns An object with `hours`, `minutes`, and `seconds` fields representing
 *   the converted duration.
 */
export function toHMS(
    duration: number,
    unit: "milliseconds" | "seconds" = "seconds"
): { hours: number; minutes: number; seconds: number } {
    const absDuration = Math.abs(duration);
    let totalSeconds: number;

    switch (unit) {
        case "milliseconds":
            totalSeconds = Math.floor(absDuration / 1_000);
            break;
        case "seconds":
            totalSeconds = Math.floor(absDuration);
            break;
        default:
            // Fallback: treat as seconds (defensive, though callers should pass a valid unit)
            totalSeconds = Math.floor(absDuration);
    }

    const hours = Math.max(0, Math.floor(totalSeconds / 3600));
    const minutes = Math.max(0, Math.floor((totalSeconds % 3600) / 60));
    const seconds = Math.max(0, totalSeconds % 60);
    return { hours, minutes, seconds };
}

/**
 * Translates a duration value and unit into a localized string.
 *
 * - Uses a small internal translation map for English and Persian ("fa").
 *
 * @param value - The numeric duration value.
 * @param unit - The unit key (e.g., "years", "minutes").
 * @param locale - The locale to translate into ("en" | "fa").
 * @returns A translated string like "2 years" or "۲ سال".
 */
function translateDuration(
    value: number,
    unit: TimeUnit,
    locale: "en" | "fa"
): string {
    const translation = DURATION_TRANSLATIONS[unit][locale];
    return `${value} ${translation}`;
}

/**
 * Converts a duration into a human-readable string composed of non-zero parts.
 *
 * - Uses moment.duration to extract calendar units.
 * - For English locales parts are joined with ", "; for Persian locales parts are
 *   joined with " و ".
 * - If the duration is zero, a localized zero-seconds text is returned.
 *
 * @param duration - The duration amount (e.g., 3661000 for milliseconds).
 * @param unit - The unit of the `duration` argument (defaults to
 *   "milliseconds").
 * @param locale - The locale for formatting ("en" | "fa"). Defaults to "en".
 * @returns A humanized duration string such as "1 hour, 1 minute" or the
 *   localized zero-value string when the duration has no non-zero parts.
 */
export function humanize(
    duration: number,
    unit: moment.DurationInputArg2 = "milliseconds",
    locale: "en" | "fa" = "en"
): string {
    const dur = moment.duration(Math.abs(duration), unit);
    const parts: string[] = [];

    const units = [
        { value: dur.years(), unit: "years" },
        { value: dur.months(), unit: "months" },
        { value: dur.days(), unit: "days" },
        { value: dur.hours(), unit: "hours" },
        { value: dur.minutes(), unit: "minutes" },
        { value: dur.seconds(), unit: "seconds" },
    ];

    for (const { value, unit } of units) {
        if (value !== 0) {
            parts.push(translateDuration(value, unit as TimeUnit, locale));
        }
    }

    return parts.length > 0
        ? parts.join(locale === "en" ? ", " : " و ")
        : translateDuration(0, "seconds", locale);
}
