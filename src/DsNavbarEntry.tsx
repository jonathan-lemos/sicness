/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import React from "react";
import { ActiveType } from "./DsApp";

export type DsNavbarEntryType = "active" | "inactive" | "disabled";

export interface IDsNavbarEntryProps {
	action: string;
	id: ActiveType | null;
	onClick: (id: ActiveType) => void;
	onClickAction: () => void;
	title: string;
	type: "active" | "inactive" | "disabled";
}

export class DsNavbarLink extends React.Component<IDsNavbarEntryProps> {
	public static defaultProps: IDsNavbarEntryProps = {
		action: "Action",
		id: null,
		onClick: (id: ActiveType) => {/** */},
		onClickAction: () => {/** */},
		title: "Title",
		type: "inactive",
	};

	constructor(props: IDsNavbarEntryProps) {
		if (props.id === null) {
			throw new Error("This DsNavbarEntry does not have an id");
		}
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	public render() {
		const liClass = "nav-item" + (this.props.type === "active" ? " active" : "");
		const aClass = "nav-link" + (this.props.type === "disabled" ? " disabled" : "");

		return (
			<li className={liClass}>
				<a className={aClass} onClick={this.handleClick}>
					{this.props.title}
				</a>
			</li>
		);
	}

	private handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
		this.props.onClick(this.props.id as ActiveType);
	}
}
