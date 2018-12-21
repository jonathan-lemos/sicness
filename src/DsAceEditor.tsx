/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import "brace";
import React from "react";
import "./mode-sicxe";

export type KeyBindingsType = null | "vim" | "emacs";

export interface IDsAceEditorProps {
	id: string;
	keyBindings: KeyBindingsType;
	value: string;
}

export interface IDsAceEditorState {
	keyBindings: KeyBindingsType;
	value: string;
}

export class DsAceEditor extends React.Component<IDsAceEditorProps, IDsAceEditorState> {
	public static defaultProps: IDsAceEditorProps = {
		id: "editor",
		keyBindings: null,
		value: "qqq",
	};

	private editor: AceAjax.Editor | null;

	constructor(props: IDsAceEditorProps) {
		super(props);
		this.state = {
			keyBindings: this.props.keyBindings,
			value: this.props.value,
		};
		this.editor = null;

		this.getKeyBindings = this.getKeyBindings.bind(this);
		this.setKeyBindings = this.setKeyBindings.bind(this);
		this.getValue = this.getValue.bind(this);
		this.setValue = this.setValue.bind(this);
		this.copyState = this.copyState.bind(this);
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
		this.editor.setKeyboardHandler(this.state.keyBindings === null ? "" : this.state.keyBindings);
		this.editor.setValue(this.state.value);
	}

	public getKeyBindings(): KeyBindingsType {
		return this.state.keyBindings;
	}

	public setKeyBindings(k: KeyBindingsType): void {
		const q = this.copyState();
		q.keyBindings = k;
		this.setState(q);

		if (this.editor !== null) {
			this.editor.setKeyboardHandler(k === null ? "" : k);
		}
	}

	public getValue(): string {
		return this.state.value;
	}

	public setValue(s: string): void {
		const q = this.copyState();
		q.value = s;
		this.setState(q);

		if (this.editor !== null) {
			this.editor.setValue(s);
		}
	}

	private copyState(): IDsAceEditorState {
		return {
			keyBindings: this.state.keyBindings,
			value: this.state.value,
		};
	}

	private changeHandler(): void {
		if (this.editor === null) {
			return;
		}
		const q = this.copyState();
		q.value = this.editor.getValue();
		this.setState(q);
	}
}
