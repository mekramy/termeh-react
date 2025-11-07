import { memo, useMemo } from "react";
import { mask } from "../utils/masker";
import type { MaskOption } from "../types";

/**
 * Props for the `Masker` component.
 *
 * @param {string} value - The input string to be masked.
 * @param {MaskOption} constructor - The mask configuration or definition.
 * @interface MaskerProps
 */
interface MaskerProps {
    /** The input string to be masked */
    value: string;
    /** Configuration object for the masking pattern */
    constructor: MaskOption;
}

/**
 * Render a masked representation of a string using the provided mask.
 *
 * @param {MaskerProps} props - Component props.
 * @param {string} props.value - The input string to apply the mask on.
 * @param {MaskOption} props.constructor - Mask configuration used to format the
 *   value.
 * @returns {JSX.Element} A React fragment containing the masked string.
 */
const Masker: React.FC<MaskerProps> = ({ value, constructor }) => {
    const masked = useMemo(
        () => mask(value, constructor),
        [value, constructor]
    );

    return <>{masked}</>;
};

Masker.displayName = "Masker";
export default memo(Masker);
