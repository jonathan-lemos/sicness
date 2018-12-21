/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
*/

import React from "react";
import { KeyBindingsType } from "./DsAceEditor";
import { DsCompiler } from "./DsCompiler";
import { DsDebugger } from "./DsDebugger";
import { DsFooter } from "./DsFooter";
import { DsNavbar } from "./DsNavbar";
import { SicCompiler } from "./SicCompiler/SicCompiler";

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

export class DsApp extends React.Component<IDsAppProps, IDsAppState> {
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

		this.state = {
			active: "compiler",
			compKeyBindings: null,
		};

		this.getActive = this.getActive.bind(this);
		this.setActive = this.setActive.bind(this);
		this.getKeyBindings = this.getKeyBindings.bind(this);
		this.setKeyBindings = this.setKeyBindings.bind(this);
		this.copyState = this.copyState.bind(this);

		this.navbar = this.compiler = this.debugger = this.footer = null;
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
		let content: JSX.Element;
		switch (this.getActive()) {
			case "compiler":
				content = <DsCompiler ref={c => this.compiler = c} />;
				this.debugger = null;
				break;
			case "debugger":
				content = <DsDebugger ref={d => this.debugger = d} />;
				this.compiler = null;
				break;
			default:
				throw new Error(`Invalid getActive: ${this.getActive}`);
		}

		const entries = [
			{
				action: "Compile",
				id: "compiler" as ActiveType,
				onClick: () => this.handleCompile(),
				title: "Compiler",
			},
			{
				action: "Debug",
				id: "debugger" as ActiveType,
				onClick: () => this.handleDebug(),
				title: "Debugger",
			},
		];

		return (
			<div className="container-fluid bg-dark d-flex h-100 flex-column">
				<DsNavbar
					brand={this.props.brand}
					entries={entries}
					font={this.props.font}
					href={this.props.href}
					onChangeActive={this.setActive}
					ref={nav => this.navbar = nav}
				/>
				{content}
				<DsFooter ref={f => this.footer = f} />
			</div>
		);
	}

	private handleCompile(): void {
		try {
			if (this.compiler === null) {
				throw new Error("this.compiler was null when handleCompile() was called.");
			}
			const lines = this.compiler.getEditorText().split("\n");
			const sicc = new SicCompiler(lines);
			let output = [];
			output.push("-----lst-----");
			output = output.concat(sicc.makeLst());
			output = output.concat(["", "", "-----obj-----"]);
			output = output.concat(sicc.makeObj());
			this.compiler.setOutputText(output.reduce((a, v) => a + "\n" + v));
		}
		catch (e) {
			alert((e as Error).message);
		}
	}

	private handleDebug(): void {
		alert("todo");
	}

	private copyState(): IDsAppState {
		const q = this.state;
		return {
			active: q.active,
			compKeyBindings: q.compKeyBindings,
		};
	}
}
