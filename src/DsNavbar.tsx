/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import React from "react";
import { Navbar, NavbarBrand } from "reactstrap";
import { IDsAppState } from "./IDsAppState";

export interface IDsNavbarProps {
	brand: string;
	font: string;
	href: string;
}

export default class ReactNavbar extends React.Component<IDsNavbarProps, IDsAppState>{
	public static defaultProps: IDsNavbarProps = {
		brand: "down with the SICness",
		font: "Comic Sans MS",
		href: "#",
	};

	constructor(props: IDsNavbarProps) {
		super(props);
	}

	public render() {
		const links = React.Children.map(this.props.children, m => {
			
		});
		return (
			<Navbar className="navbar-expand-lg navbar-dark bg-dark">
				<NavbarBrand href="#" style={`font-face: ${this.props.font}`}>
					{this.props.brand}
				</NavbarBrand>
				<div className="collapse navbar-collapse">
					{this.props.children}
				</div>
			</Navbar>
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
