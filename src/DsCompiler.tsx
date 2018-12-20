/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import brace from "brace";
import React from "react";
import AceEditor from "react-ace";
import { Col, Row } from "reactstrap";

import "./mode-sicxe";

export type KeyBindingsType = "" | "vim" | "emacs";

export interface IDsCompilerProps {
	editorValue: string;
	keyBindings: KeyBindingsType;
	outputValue: string;
}

export interface IDsCompilerState {
	editorState: string;
	keyBindings: KeyBindingsType;
	outputState: string;
}

export class DsCompiler extends React.Component<IDsCompilerProps, IDsCompilerState> {
	public static defaultProps: IDsCompilerProps = {
		editorValue: "",
		keyBindings: "",
		outputValue: "",
	};

	constructor(props: IDsCompilerProps) {
		super(props);
		this.state = {
			editorState: this.props.editorValue,
			keyBindings: this.props.keyBindings,
			outputState: this.props.outputValue,
		};

		this.getEditorText = this.getEditorText.bind(this);
		this.setEditorText = this.setEditorText.bind(this);
		this.getOutputText = this.getOutputText.bind(this);
		this.setOutputText = this.setOutputText.bind(this);
		this.getKeyBindings = this.getKeyBindings.bind(this);
		this.setKeyBindings = this.setKeyBindings.bind(this);
		this.handleEditorChange = this.handleEditorChange.bind(this);
		this.handleOutputChange = this.handleOutputChange.bind(this);
		this.copyState = this.copyState.bind(this);
	}

	public getEditorText() {
		return this.state.editorState;
	}

	public getKeyBindings() {
		return this.state.keyBindings;
	}

	public getOutputText() {
		return this.state.outputState;
	}

	public setEditorText(s: string): void {
		const q = this.copyState();
		q.editorState = s;
		this.setState(q);
	}

	public setKeyBindings(s: KeyBindingsType): void {
		const q = this.copyState();
		q.keyBindings = s;
		this.setState(q);
	}

	public setOutputText(s: string) {
		const q = this.copyState();
		q.outputState = s;
		this.setState(q);
	}

	public render() {
		return (
			<Row className="bg-dark flex d-flex justify-content-start flex-fill">
				<Col>
					<AceEditor
						mode="brace/mode/sicxe"
						theme="brace/mode/monokai"
						name="editor"
						keyboardHandler={this.state.keyBindings}
						value={this.state.editorState}
						onChange={this.handleEditorChange}
					/>
				</Col>
				<Col>
					<textarea
						id="output"
						placeholder="Output goes here"
						readOnly={true}
						wrap="soft"
						className="form-control bg-dark text-light"
						value={this.state.outputState}
						onChange={this.handleOutputChange}
					/>
				</Col>
			</Row>
		);
	}

	private handleEditorChange(value: string, event?: any): void {
		this.setEditorText(value);
	}

	private handleOutputChange(event: React.ChangeEvent<HTMLTextAreaElement>): void {
		this.setOutputText(event.target.value);
	}

	private copyState(): IDsCompilerState {
		return {
			editorState: this.state.editorState,
			keyBindings: this.state.keyBindings,
			outputState: this.state.outputState,
		};
	}
}
