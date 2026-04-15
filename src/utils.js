/**
 * Shared pure-math utilities.
 * Import from here instead of redefining per-file.
 */

/**
 * Clamps `v` to the closed interval [min, max].
 * @param {number} v   - Value to constrain
 * @param {number} min - Lower bound (inclusive)
 * @param {number} max - Upper bound (inclusive)
 * @returns {number}
 */
export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/**
 * Normalises `v` from the range [a, b] to [0, 1], clamped.
 * Equivalent to `clamp((v - a) / (b - a), 0, 1)`.
 * @param {number} v - Input value
 * @param {number} a - Range start
 * @param {number} b - Range end
 * @returns {number} Normalised value in [0, 1]
 */
export const norm = (v, a, b) => clamp((v - a) / (b - a), 0, 1);

/**
 * Linear interpolation between `a` and `b` by factor `t`.
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Mix factor, typically [0, 1]
 * @returns {number}
 */
export const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Maps a value from one range to another, clamped.
 * @param {number} v      - Input value
 * @param {number} inMin  - Input range start
 * @param {number} inMax  - Input range end
 * @param {number} outMin - Output range start
 * @param {number} outMax - Output range end
 * @returns {number}
 */
export const mapRange = (v, inMin, inMax, outMin, outMax) =>
    outMin + (outMax - outMin) * norm(v, inMin, inMax);
