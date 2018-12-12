/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
*/

import React from "react";
import { DsCompiler } from "./DsCompiler";
import { DsDebugger } from "./DsDebugger";
import { DsFooter } from "./DsFooter";
import { DsNavbar } from "./DsNavbar";

export interface IDsAppProps {
	brand: string;
	font: string;
	href: string;
}

export interface IDsAppState {
	active: "compiler" | "debugger";
}

export class DsApp extends React.Component<IDsAppProps, IDsAppState>{
	public static defaultProps: IDsAppProps = {
		brand: "down with the SICness",
		font: "Comic Sans MS",
		href: "#",
	};

	private navbar: JSX.Element;
	private compiler: JSX.Element;
	private debugger: JSX.Element;
	private footer: JSX.Element;

	constructor(props: IDsAppProps) {
		super(props);
		this.switchState = this.switchState.bind(this);

		this.navbar = <DsNavbar brand={this.props.brand} font={this.props.font} href={this.props.href} />;
		this.compiler = <DsCompiler />;
		this.debugger = <DsDebugger />;
		this.footer = <DsFooter />;
	}

	public switchState(state: IDsAppState): void {
		this.setState(state);
	}

	public getState(): "compiler" | "debugger" {
		return this.state.active;
	}

	public render() {
		const content = this.getState() === "compiler" ?
			this.compiler : this.debugger;

		return (
			<div>
				{this.navbar}
				{content}
				{this.footer}
			</div>
		);
	}
}
