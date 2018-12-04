/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import React from "react";
import { Navbar, NavbarBrand } from "reactstrap";

export interface IReactNavbarProps {
	brand: string;
	font: string;
	href: string;
}

export interface IReactNavbarState {
	active: "compiler" | "debugger";
}

export default class ReactNavbar extends React.Component<IReactNavbarProps, IReactNavbarState>{
	public static defaultProps: IReactNavbarProps = {
		brand: "down with the SICness",
		font: "Comic Sans MS",
		href: "#",
	};

	constructor(props: IReactNavbarProps) {
		super(props);
	}

	public render() {
		return (
			<Navbar
				className="navbar-expand-lg navbar-dark bg-dark"
				>
				<NavbarBrand
					href="#"
					style={`font-face: ${this.props.font}`}
					>
					{this.props.brand}
				</NavbarBrand>
			</Navbar>
		);
	}
}
