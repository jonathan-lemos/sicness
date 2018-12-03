/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
*/

import "ace";
// import * as ace from "ace-builds";
import "jquery";
import { SicCompiler } from "./SicCompiler/SicCompiler";

// ace.config.set("basePath", "/");
// ace.config.set("modePath", "/");
// ace.config.set("themePath", "/");
const editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
// editor.session.setUseWorker(false);
// ace.config.set("modePath", ".");
editor.session.setMode("ace/mode/sicxe");

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
		const comp = new SicCompiler(arr);
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
