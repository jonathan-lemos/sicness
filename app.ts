/*
 * Copyright (c) 2018 Jonathan Lemos
 * 
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
*/

import * as sic_cc from "./sicxe_cc";

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

let htmlToArray = (html: string): string[] => {
	let re1  = new RegExp("<div>", "g");
	let re2  = new RegExp("</div>", "g");
	let re3  = new RegExp("<br>", "g");

	let parsed = html.replace(re1, "").replace(re2, "\n").replace(re3, "").split("\n");
	if (re2.test(html)){
		parsed.pop();
	}
	return parsed;
}

let arrayToHtml = (array: string[]): string => {
	let s = "";
	for (let i = 0; i < array.length - 1; ++i){
		s += "<div>";
		s += array[i];
		s += "</div>"
	}
	if (s === ""){
		return "<div>" + array[0] + "</div><br>";
	}
	return s + "<div>" + array[array.length - 1] + "<br></div><br>";
}

let numbersToHex = (numbers: number[]): string => {
	let s = ""
	numbers.forEach((val: number) => {
		s += val.toString(16);
	});
	return s;
}

lm("button_run").onclick = (): void => {
	let arr = htmlToArray(lm("editor").innerHTML);
	let output = sic_cc.sic_compile(arr);
	lm("output").innerHTML = numbersToHex(output);
}