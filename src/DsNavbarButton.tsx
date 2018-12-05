/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import React from "react";

export interface IDsNavbarButtonProps {
	onClick: () => void;
	text: string;
	theme: "default" | "dark" | "danger" | "warning" | "success";
}

export class DsNavbarButton extends React.Component<IDsNavbarButtonProps> {
	public static defaultProps: IDsNavbarButtonProps = {
		onClick: () => {/* empty */},
		text: "",
		theme: "default",
	};

	constructor(props: IDsNavbarButtonProps) {
		super(props);
	}

	public render() {
		const btnClass = "btn" + (this.props.theme === "default" ? "" : (` btn-outline-${this.props.theme}`));

		return (
			<button className={btnClass} onClick={this.props.onClick}>{this.props.text}</button>
		);
	}
}
