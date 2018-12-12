/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import React from "react";
import { Navbar, NavbarBrand } from "reactstrap";
import { IDsAppState } from "./DsApp";
import { DsNavbarButton } from "./DsNavbarButton";
import { DsNavbarLink } from "./DsNavbarLink";

export interface IDsNavbarProps {
	brand: string;
	font: string;
	href: string;
	onCompile: () => void;
	onDebug: () => void;
}

export class DsNavbar extends React.Component<IDsNavbarProps, IDsAppState>{
	public static defaultProps: IDsNavbarProps = {
		brand: "down with the SICness",
		font: "Comic Sans MS",
		href: "#",
		onCompile: () => {/**/},
		onDebug: () => {/**/},
	};

	constructor(props: IDsNavbarProps) {
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
			<Navbar className="navbar navbar-expand-md navbar-dark bg-dark">
				<NavbarBrand href="#" style={`font-face: ${this.props.font}`}>
					{this.props.brand}
				</NavbarBrand>
				<button
					className="navbar-toggler"
					type="button"
					data-toggle="collapse"
					data-target="#navbarCollapse"
					aria-controls="navbarCollapse"
					aria-expanded="false"
					aria-label="Toggle navigation">
					<span className="navbar-toggler-icon"></span>
				</button>
				<div id="navbarCollapse" className="collapse navbar-collapse">
					<ul className="nav navbar-nav mr-auto">
						{this.getButtonBank()}
					</ul>
					<ul className="nav navbar-nav mr-auto navbar-right">
						<DsNavbarLink
							buttonState={this.state.active === "compiler" ? "active" : "inactive"}
							onClick={() => { this.switchState("compiler"); }}
							text="Compiler" />
						<DsNavbarLink
							buttonState={this.state.active === "debugger" ? "active" : "inactive"}
							onClick={() => { this.switchState("debugger"); }}
							text="Debugger" />
					</ul>
				</div>
			</Navbar>
		);
	}

	private getButtonBank() {
		switch (this.state.active) {
			case "compiler":
				return (
					<DsNavbarButton
						onClick={this.props.onCompile}
						text="Compile"
						theme="danger" />
				);
			case "debugger":
				return (
					<DsNavbarButton
						onClick={this.props.onDebug}
						text="Debug"
						theme="danger" />
				);
			// shut up tslint
			default:
				throw new Error(`this.state.active cannot be ${this.state.active}`);
		}
	}
}
