/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

/**
 * Converts a number to its hexadecimal string equivalent.
 */
export const asHex = (n: number): string => n.toString(16).toUpperCase();

/**
 * Converts a number to its hexadecimal word (3-byte) equivalent.
 */
export const asWord = (n: number): string => asHex(n).padStart(6, "0");

/**
 * Converts a number to its hexadecimal byte equivalent.
 */
export const asByte = (n: number): string => asHex(n).padStart(2, "0");

/**
 * Converts an array of bytes into a single hexadecimal string.
 */
export const bytesToString = (n: number[]): string => n.reduce((acc: string, val: number) => acc + asByte(val), "");