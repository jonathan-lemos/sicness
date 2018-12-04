/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import React from "react";
import { Navbar, NavbarBrand } from "reactstrap";

export default class ReactNavbar extends React.Component<
	{
		brand: string;
		font: string;
	}
>{
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
