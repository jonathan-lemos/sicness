/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
*/

import * as cc from "./sicxe_cc";

const lm = (id: string): HTMLElement => {
	let e = document.getElementById(id);
	if (e == null){
		throw "Element " + id + " was not found in the DOM";
	}
	return e;
}

const onKeyDown = (e: any) => {
	// if tab was pressed
	if (e.keyCode === 9){
		// do not tab out of the editor
		e.preventDefault();

		// instead, insert a tab into our editor.
		let editor = lm("editor");
        let doc = editor.ownerDocument.defaultView;
        let sel = doc.getSelection();
        let range = sel.getRangeAt(0);

        let tabNode = document.createTextNode("\t");
        range.insertNode(tabNode);

        range.setStartAfter(tabNode);
        range.setEndAfter(tabNode);
        sel.removeAllRanges();
        sel.addRange(range);
	}
}

const textToArray = (innerText: string): string[] => {
	return innerText.split("\n");
}

const arrayToText = (array: string[]): string => {
	return array.reduce((acc, val) => acc + '\n' + val);
}

const formatLst = (array: cc.sic_lst[]): string[] => {
	let locMax = 0, bcMax = 0;
	array.forEach(val => {
		if (val.loc.length > locMax){
			locMax = val.loc.length;
		}
		if (val.bytecode.length > bcMax){
			bcMax = val.bytecode.length;
		}
	});
	let lines = [
		"loc".padEnd(locMax, " ") + "\t" + "byte".padEnd(bcMax, " ") + "\t" + "source",
		"".padEnd(locMax, "-") + "\t" + "".padEnd(bcMax, "-") + "\t" + "------"
	];
	return lines.concat(array.map(val => val.loc.padEnd(locMax, " ") + "\t" + val.bytecode.padEnd(bcMax, " ") + "\t'" + val.instr + "'"));
}

lm("button_run").onclick = (): void => {
	try {
		let arr = textToArray(lm("editor").innerText);
		let p1 = new cc.sic_pass1(arr);
		lm("output").innerText = arrayToText(formatLst(p1.toLst()));
	}
	catch (e){
		alert(e);
	}
}
