/**
 * Media Query hooks for responsive design and device capability detection.
 *
 * These hooks use the Media Queries API to detect various screen sizes, device
 * capabilities, and user preferences. Each hook returns a boolean indicating
 * whether the corresponding media query matches.
 *
 * @module mq
 */

export * from "./ueMediaQuery";

// Screen size breakpoints
export { useIsDesktop } from "./useIsDesktop";
export { useIsFullhd } from "./useIsFullhd";
export { useIsMobile } from "./useIsMobile";
export { useIsTablet } from "./useIsTablet";
export { useIsUntilDesktop } from "./useIsUntilDesktop";
export { useIsUntilFullhd } from "./useIsUntilFullhd";
export { useIsUntilWidescreen } from "./useIsUntilWidescreen";
export { useIsWidescreen } from "./useIsWidescreen";

// Screen size ranges
export { useIsDesktopOnly } from "./useIsDesktopOnly";
export { useIsTabletOnly } from "./useIsTabletOnly";
export { useIsWidescreenOnly } from "./useIsWidescreenOnly";

// Device capabilities
export { useHasCoarsePointer } from "./useHasCoarsePointer";
export { useHasFinePointer } from "./useHasFinePointer";
export { useIsLandscape } from "./useIsLandscape";
export { useIsNoneTouch } from "./useIsNoneTouch";
export { useIsNotPrint } from "./useIsNotPrint";
export { useIsPortrait } from "./useIsPortrait";
export { useIsPrint } from "./useIsPrint";
export { useIsRetina } from "./useIsRetina";
export { useIsTouch } from "./useIsTouch";

// User preferences
export { usePrefersDark } from "./usePrefersDark";
export { usePrefersHDR } from "./usePrefersHDR";
export { usePrefersLessContrast } from "./usePrefersLessContrast";
export { usePrefersLight } from "./usePrefersLight";
export { usePrefersMoreContrast } from "./usePrefersMoreContrast";
export { usePrefersReducedMotion } from "./usePrefersReducedMotion";
