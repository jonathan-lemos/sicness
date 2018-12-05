/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import React from "react";
import { Navbar, NavbarBrand } from "reactstrap";
import { DsNavbarButton } from "./DsNavbarButton";
import { DsNavbarLink } from "./DsNavbarLink";

export interface IDsNavbarProps {
	brand: string;
	font: string;
	href: string;
}

export interface IDsNavbarState {
	active: "compiler" | "debugger";
}

export default class ReactNavbar extends React.Component<IDsNavbarProps, IDsNavbarState>{
	public static defaultProps: IDsNavbarProps = {
		brand: "down with the SICness",
		font: "Comic Sans MS",
		href: "#",
	};

	constructor(props: IDsNavbarProps) {
		super(props);
	}

	public switchState() {
		/* empty */
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
					<ul className="navbar-nav mr-auto">
						<DsNavbarLink
							buttonState="active"
							onClick={() => {/**/}}
							/>
					</ul>

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
