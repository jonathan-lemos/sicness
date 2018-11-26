/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
*/

import "ace";
import "jquery";
import * as cc from "./sicxe_cc";

const editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setOption("modePath", ".");
editor.session.setMode("mode-sicxe.js");

$("#output").val("");

const textToArray = (innerText: string): string[] => {
	return innerText.split("\n");
};

const arrayToText = (array: string[]): string => {
	return array.reduce((acc, val) => acc + "\n" + val);
};

$("#btnCompile").click((): void => {
	try {
		const arr = textToArray(editor.getValue());
		const comp = new cc.SicCompiler(arr);
		let output = ["-----lst-----"];
		output = output.concat(comp.makeLst());
		if (!comp.err) {
			output = output.concat("", "", "-----obj-----");
			output = output.concat(comp.makeObj());
		}
		else {
			output = output.concat("", "", "No obj generation due to errors in lst.");
		}
		$("#output").val(arrayToText(output));
	}
	catch (e) {
		alert((e as Error).message);
	}
});
