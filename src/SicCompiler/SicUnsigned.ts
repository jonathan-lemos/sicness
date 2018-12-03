/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { asHex } from "./SicFmt";

/**
 * Creates a bitmask of n bits.
 * @param nBits The number of bits (starting from the right) that should be toggled on.
 * For example, sicMakeMask(11) === 0x7FF
 */
export const sicMakeMask = (nBits: number): number => {
	let m = 0x0;
	for (let i = 0; i < nBits; ++i) {
		m |= (1 << i);
	}
	return m;
};

/**
 * Checks that a number fits into an unsigned n-bit range, throwing an exception if it doesn't.
 * @param val The number to check.
 * @param nBits The number of bits it should fit into.
 */
export const sicCheckUnsigned = (val: number, nBits: number): void => {
	if (val < 0x0 || val > sicMakeMask(nBits)) {
		throw new Error(asHex(val) + " does not fit in an unsigned " + nBits + "-bit range");
	}
};

/**
 * Optionally converts a signed value into its n-bit unsigned equivalent,
 * and checks if the result fits into a signed n-bit range.
 * @param val The number to create an unsigned value for.
 * @param nBits The number of signed bits the value should fit in.
 * @returns The new unsigned value.
 */
export const sicMakeUnsigned = (val: number, nBits: number): number => {
	const m = sicMakeMask(nBits - 1);
	if (val < -m - 1 || val > m) {
		throw new Error(asHex(val) + " does not fit in a signed " + nBits + "-bit range");
	}

	val >>>= 0;
	val &= sicMakeMask(nBits);
	return val;
};
