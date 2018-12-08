/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import React from "react";
import { IDsAppState } from "./IDsAppState";

export interface IDsFooterProps {
	brand: string;
	font: string;
	href: string;
}

export class DsFooter extends React.Component<IDsFooterProps, IDsAppState>{
	public static defaultProps: IDsFooterProps = {
		brand: "down with the SICness",
		font: "Comic Sans MS",
		href: "#",
	};

	constructor(props: IDsFooterProps) {
		super(props);
		this.switchState = this.switchState.bind(this);
	}

	public switchState(active?: "compiler" | "debugger"): void {
		if (active === undefined) {
			active = this.state.active === "compiler" ? "debugger" : "compiler";
		}
		if (active === this.state.active) {
			return;
		}
		this.setState({ active: this.state.active });
	}

	public getState(): "compiler" | "debugger" {
		return this.state.active;
	}

	public render() {
		return (
			<footer
				className="footer-dark"
			>

			</footer>
		);
	}
}
