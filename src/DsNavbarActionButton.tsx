/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import React from "react";
import { ActiveType } from "./DsApp";

export type DsNavbarThemeType = "default" | "dark" | "danger" | "warning" | "success";

export interface IDsNavbarButtonProps {
	id: ActiveType | null;
	onClick: (id: ActiveType) => void;
	theme: DsNavbarThemeType;
	title: string;
}

export class DsNavbarActionButton extends React.Component<IDsNavbarButtonProps> {
	public static defaultProps: IDsNavbarButtonProps = {
		id: null,
		onClick: (id: ActiveType) => {/** */},
		theme: "default",
		title: "",
	};

	constructor(props: IDsNavbarButtonProps) {
		if (props.id === null) {
			throw new Error("This DsNavbarActionButton needs an ID");
		}
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	public render() {
		const btnClass = "btn" + (this.props.theme === "default" ? "" : (` btn-outline-${this.props.theme}`));

		return (
			<button className={btnClass} onClick={this.handleClick}>
				{this.props.title}
			</button>
		);
	}

	private handleClick(event: React.MouseEvent<HTMLButtonElement>) {
		this.props.onClick(this.props.id as ActiveType);
	}
}
