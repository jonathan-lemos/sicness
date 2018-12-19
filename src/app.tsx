/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
*/

import "jquery";
import React from "react";
import ReactDOM from "react-dom";
import { DsApp } from "./DsApp";

const byId = (id: string): HTMLElement => {
	const e =  document.getElementById(id);
	if (e == null) {
		throw new Error(`No element with id "${id}"`);
	}
	return e;
};

const app = <DsApp />;
ReactDOM.render(app, byId("app"));
