/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
*/
import * as cc from "./sicxe_cc.js";
const lm = (id) => {
    let e = document.getElementById(id);
    if (e == null) {
        throw "Element " + id + " was not found in the DOM";
    }
    return e;
};
const onKeyDown = (e) => {
    // if tab was pressed
    if (e.keyCode === 9) {
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
};
const textToArray = (innerText) => {
    return innerText.split("\n");
};
const arrayToText = (array) => {
    return array.reduce((acc, val) => acc + '\n' + val).slice(0, -1);
};
lm("button_run").onclick = () => {
    let arr = textToArray(lm("editor").innerText);
    let p1 = new cc.sic_pass1(arr);
    let lines = [
        "loc\tbytecode\tsource",
        "---\t--------\t------"
    ];
    lines = lines.concat(p1.toLst().map(val => val.loc + '\t' + val.bytecode + '\t"' + val.instr + '"'));
    lm("output").innerText = arrayToText(lines);
};
