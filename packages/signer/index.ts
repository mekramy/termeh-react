import { flatten } from "./utils";

/**
 * Generates a SHA-256 checksum for an object.
 *
 * @param data - Object to sign.
 * @returns Hexadecimal checksum string.
 */
export async function sign(data: unknown): Promise<string> {
    const flatted = flatten(data).join("|");
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(flatted);
    const hashBuffer = await crypto.subtle.digest("SHA-256", encodedData);
    return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * Validates if an object's checksum matches a given signature.
 *
 * @param data - Object to validate.
 * @param signature - Signature to compare.
 * @returns True if the signature matches.
 */
export async function validate(
    data: unknown,
    signature: string
): Promise<boolean> {
    return (await sign(data)) === signature;
}
