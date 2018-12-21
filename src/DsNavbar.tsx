/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import React from "react";
import { Navbar, NavbarBrand } from "reactstrap";
import { ActiveType } from "./DsApp";
import { DsNavbarActionButton } from "./DsNavbarActionButton";
import { DsNavbarEntry } from "./DsNavbarEntry";
export interface IDsNavEntry {
	action: string;
	id: ActiveType;
	onClick: () => void;
	title: string;
}
export interface IDsNavbarProps {
	brand: string;
	entries: IDsNavEntry[];
	font: string;
	href: string;
	onChangeActive: ((a: ActiveType) => void) | null;
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
		onChangeActive: null,
	};

	private entries: Array<DsNavbarEntry | null>;

	constructor(props: IDsNavbarProps) {
		super(props);
		if (this.props.entries.length === 0) {
			throw new Error("The entries array in a DsNavbar must have at least one element.");
		}

		this.getActive = this.getActive.bind(this);
		this.setActive = this.setActive.bind(this);
		this.makeChildren = this.makeChildren.bind(this);
		this.handleChange = this.handleChange.bind(this);

		this.state = { active: this.props.entries[0].id };
		this.entries = [];
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
				<NavbarBrand href="#">
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
						{this.makeActionButton(this.props.entries, this.state.active)}
					</ul>
					<ul className="nav navbar-nav mr-auto navbar-right">
						{this.makeChildren(this.props.entries, this.state.active)}
					</ul>
				</div>
			</Navbar>
		);
	}

	private makeActionButton(entries: IDsNavEntry[], active: ActiveType): JSX.Element {
		for (const entry of entries) {
			if (entry === null || entry.id !== active) {
				continue;
			}

			return <DsNavbarActionButton
				identifier={entry.id}
				onClick={entry.onClick}
				theme="danger"
				title={entry.action}
			/>;
		}
		throw new Error("Could not find button with current active id: " + active);
	}

	private makeChildren(entries: IDsNavEntry[], active: ActiveType): JSX.Element[] {
		return entries.map((e, i) => {
			return <DsNavbarEntry
				action={e.action}
				identifier={e.id}
				key={i}
				onClick={this.handleChange}
				ref={entry => this.entries.push(entry)}
				title={e.title}
				type={e.id === active ? "active" : "inactive"}
			/>;
		});
	}

	private handleChange(id: ActiveType): void {
		for (const e of this.entries) {
			if (e === null) {
				continue;
			}
			e.setType(e.props.identifier === id ? "active" : "inactive");
		}
		if (this.props.onChangeActive !== null) {
			this.props.onChangeActive(id);
		}
	}
}
