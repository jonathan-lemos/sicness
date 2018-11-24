/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
*/

import * as cc from "./sicxe_cc";

const lm = (id: string): HTMLElement => {
	const e = document.getElementById(id);
	if (e == null) {
		throw new Error("Element " + id + " was not found in the DOM");
	}
	return e;
};

const onKeyDown = (e: any) => {
	// if tab was pressed
	if (e.keyCode === 9) {
		// do not tab out of the editor
		e.preventDefault();

		// instead, insert a tab into our editor.
		const editor = lm("editor");
		const doc = editor.ownerDocument.defaultView;
		const sel = doc.getSelection();
		const range = sel.getRangeAt(0);

		const tabNode = document.createTextNode("\t");
		range.insertNode(tabNode);

		range.setStartAfter(tabNode);
		range.setEndAfter(tabNode);
		sel.removeAllRanges();
		sel.addRange(range);
	}
};

const textToArray = (innerText: string): string[] => {
	return innerText.split("\n");
};

const arrayToText = (array: string[]): string => {
	return array.reduce((acc, val) => acc + "\n" + val);
};

const pad = (str: string, len: number) => {
	while (str.length < len) {
		str = str + " ";
	}
	return str;
};

lm("button_run").onclick = (): void => {
	try {
		const arr = textToArray(lm("editor").innerText);
		const comp = new cc.SicCompiler(arr);
		let output = ["-----lst-----"];
		output = output.concat(comp.makeLst());
		output = output.concat("", "", "-----obj-----");
		output = output.concat(comp.makeObj());
		lm("output").innerText = arrayToText(output);
	}
	catch (e) {
		alert((e as Error).message);
	}
};
