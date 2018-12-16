/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
*/

import React from "react";
import { DsCompiler, KeyBindingsType } from "./DsCompiler";
import { DsDebugger } from "./DsDebugger";
import { DsFooter } from "./DsFooter";
import { DsNavbar } from "./DsNavbar";

export interface IDsAppProps {
	brand: string;
	font: string;
	href: string;
}

export type ActiveType = "compiler" | "debugger";
export interface IDsAppState {
	active: ActiveType;
	compKeyBindings: KeyBindingsType;
}

export class DsApp extends React.Component<IDsAppProps, IDsAppState>{
	public static defaultProps: IDsAppProps = {
		brand: "down with the SICness",
		font: "Comic Sans MS",
		href: "#",
	};

	private navbar: DsNavbar | null;
	private compiler: DsCompiler | null;
	private debugger: DsDebugger | null;
	private footer: DsFooter | null;

	constructor(props: IDsAppProps) {
		super(props);

		this.navbar = null;
		this.compiler = <DsCompiler />;
		this.debugger = <DsDebugger />;
		this.footer = <DsFooter />;

		this.state = {
			active: "compiler",
			compKeyBindings: "",
		};

		this.getActive = this.getActive.bind(this);
		this.setActive = this.setActive.bind(this);
		this.getKeyBindings = this.getKeyBindings.bind(this);
		this.setKeyBindings = this.setKeyBindings.bind(this);
		this.copyState = this.copyState.bind(this);
	}

	public getActive(): ActiveType {
		return this.state.active;
	}

	public setActive(s: ActiveType): void {
		const q = this.copyState();
		q.active = s;
		this.setState(q);
	}

	public getKeyBindings(): KeyBindingsType {
		return this.state.compKeyBindings;
	}

	public setKeyBindings(s: KeyBindingsType): void {
		const q = this.copyState();
		q.compKeyBindings = s;
		this.setState(q);
	}

	public render() {
		const content = this.getActive() === "compiler" ?
			<DsCompiler ref={c => this.compiler = c} /> :
			<DsDebugger ref={d => this.debugger = d} />;

		return (
			<div>
				<DsNavbar
					brand={this.props.brand}
					font={this.props.font}
					href={this.props.href}
					ref={nav => this.navbar = nav}
					onCompile={this.handleCompile}
				/>
				{content}
				{this.footer}
			</div>
		);
	}

	private handleCompile() {

	}

	private copyState(): IDsAppState {
		const q = this.state;
		return {
			active: q.active,
			compKeyBindings: q.compKeyBindings,
		};
	}
}
