/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import React from "react";

export interface IDsFooterProps {
	brand: string;
	font: string;
	href: string;
}

export interface IDsFooterState {
	active: "compiler" | "debugger";
}

export default class ReactFooter extends React.Component<IDsFooterProps, IDsFooterState>{
	public static defaultProps: IDsFooterProps = {
		brand: "down with the SICness",
		font: "Comic Sans MS",
		href: "#",
	};

	constructor(props: IDsFooterProps) {
		super(props);
	}

	public render() {
		return (
			<footer
				className="footer-dark"
				>

			</footer>
		);
	}

	public toggleState(): void {
		const s = this.state.active === "compiler" ? "debugger" : "compiler";
		this.setState({active: s});
	}

	public getState(): "compiler" | "debugger" {
		return this.state.active;
	}
}
