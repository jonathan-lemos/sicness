/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import React from "react";

export interface IDsNavbarLinkProps {
	buttonState: "active" | "inactive" | "disabled";
	onClick: () => void;
	text: string;
}

export class DsNavbarLink extends React.Component<IDsNavbarLinkProps> {
	public static defaultProps: IDsNavbarLinkProps = {
		buttonState: "inactive",
		onClick: () => {/* empty */},
		text: "",
	};

	constructor(props: IDsNavbarLinkProps) {
		super(props);
	}

	public render() {
		const liClass = "nav-item" + (this.props.buttonState === "active" ? " active" : "");
		const aClass = "nav-link" + (this.props.buttonState === "disabled" ? " disabled" : "");

		return (
			<li className={liClass}>
				<a className={aClass} onClick={this.props.onClick}>{this.props.text}</a>
			</li>
		);
	}
}
