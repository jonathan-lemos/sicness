/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import React from "react";
import { Navbar, NavbarBrand } from "reactstrap";
import { ActiveType, IDsAppState } from "./DsApp";
import { DsNavbarButton } from "./DsNavbarButton";
import { DsNavbarLink } from "./DsNavbarLink";

export interface IDsNavEntry {
	action: string;
	id: ActiveType;
	title: string;
	onClick: () => void;
}

export interface IDsNavbarProps {
	brand: string;
	entries: IDsNavEntry[];
	font: string;
	href: string;
}

export interface IDsNavbarState {
	active: ActiveType;
}

export class DsNavbar extends React.Component<IDsNavbarProps, IDsNavbarState>{
	public static defaultProps: IDsNavbarProps = {
		brand: "down with the SICness",
		entries: [],
		font: "Comic Sans MS",
		href: "#",
	};

	constructor(props: IDsNavbarProps) {
		super(props);
		if (this.props.entries.length === 0) {
			throw new Error("The entries array in a DsNavbar must have at least one element.");
		}
		this.getActive = this.getActive.bind(this);
		this.setActive = this.setActive.bind(this);
		this.state = { active: this.props.entries[0].id };
	}

	public getActive(): ActiveType {
		return this.state.active;
	}

	public setActive(a: ActiveType): void {
		this.setState({active: a});
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
