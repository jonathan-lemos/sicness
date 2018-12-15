/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
*/

import "jquery";
import React from "react";
import ReactDOM from "react-dom";
import { DsApp, IDsAppProps, IDsAppState } from "./DsApp";

const textToArray = (innerText: string): string[] => {
	return innerText.split("\n");
};

const arrayToText = (array: string[]): string => {
	return array.reduce((acc, val) => acc + "\n" + val);
};

const byId = (id: string): HTMLElement => {
	const e =  document.getElementById(id);
	if (e == null) {
		throw new Error(`No element with id "${id}"`);
	}
	return e;
};

const app = <DsApp />;

const btnCompileClick = (): void => {
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
