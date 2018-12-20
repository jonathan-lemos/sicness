/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import * as ace from "brace";
import React from "react";
import "./mode-sicxe";

export interface IDsAceEditorProps {
	id: string;
}

export interface IDsAceEditorState {
	value: string;
}

export class DsFooter extends React.Component<IDsAceEditorProps, IDsAceEditorState>{
	public static defaultProps: IDsAceEditorProps = {
		id: "editor",
	};

	private editor: ace.Editor | null;

	constructor(props: IDsAceEditorProps) {
		super(props);
		this.state = {value: ""};
		this.editor = null;

		this.getValue = this.getValue.bind(this);
		this.setValue = this.setValue.bind(this);
		this.changeHandler = this.changeHandler.bind(this);
	}

	public render() {
		return (
			<div id={this.props.id} />
		);
	}

	public componentDidMount() {
		if (this.editor !== null) {
			this.editor.destroy();
		}

		this.editor = ace.edit(this.props.id);
		this.editor.setTheme("ace/theme/monokai");
		this.editor.getSession().setMode("ace/theme/sicxe");
		this.editor.getSession().on("change", this.changeHandler);
	}

	public getValue(): string {
		return this.state.value;
	}

	public setValue(s: string): void {
		this.setState({value: s});

		if (this.editor === null) {
			return;
		}
		this.editor.setValue(s);
	}

	private changeHandler(): void {
		if (this.editor === null) {
			return;
		}
		this.setState({value: this.editor.getValue()});
	}
}
