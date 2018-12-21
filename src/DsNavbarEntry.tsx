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
	identifier: ActiveType | null;
	onClick: (id: ActiveType) => void;
	title: string;
	type: DsNavbarEntryType;
}

export interface IDsNavbarEntryState {
	type: DsNavbarEntryType;
}

export class DsNavbarEntry extends React.Component<IDsNavbarEntryProps, IDsNavbarEntryState> {
	public static defaultProps: IDsNavbarEntryProps = {
		action: "Action",
		identifier: null,
		onClick: (id: ActiveType) => {/** */},
		title: "Title",
		type: "inactive",
	};

	constructor(props: IDsNavbarEntryProps) {
		if (props.identifier === null) {
			throw new Error("This DsNavbarEntry does not have an id");
		}
		super(props);

		this.state = {type: this.props.type};
		this.handleClick = this.handleClick.bind(this);
		this.getType = this.getType.bind(this);
		this.setType = this.setType.bind(this);
	}

	public getType(): DsNavbarEntryType {
		return this.state.type;
	}

	public setType(t: DsNavbarEntryType): void {
		this.setState({type: t});
	}

	public render() {
		const liClass = "nav-item" + (this.state.type === "active" ? " active" : "");
		const aClass = "nav-link" + (this.state.type === "disabled" ? " disabled" : "");
		return (
			<li className={liClass}>
				<a className={aClass} onClick={this.handleClick}>
					{this.props.title}
				</a>
			</li>
		);
	}

	private handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
		this.props.onClick(this.props.identifier as ActiveType);
	}
}
