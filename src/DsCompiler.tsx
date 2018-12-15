/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import React from "react";
import AceEditor from "react-ace";
import { Col, Row } from "reactstrap";

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

	private editor: JSX.Element;
	private output: JSX.Element;

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

		this.editor = <AceEditor
			mode="sicxe"
			theme="monokai"
			name="editor"
			value={this.state.editorState}
			onChange={this.handleEditorChange}
		/>;
		this.output = <textarea
			id="output"
			placeholder="Output goes here"
			readOnly={true}
			wrap="soft"
			className="form-control bg-dark text-light"
			value={this.state.outputState}
			onChange={this.handleOutputChange}
		/>;
	}

	public getEditorText(): string {
		return this.state.editorState;
	}

	public setEditorText(s: string): void {
		const q = this.copyState();
		q.editorState = s;
		this.setState(q);
	}

	public getOutputText(): string {
		return this.state.editorState;
	}

	public setOutputText(s: string): void {
		const q = this.copyState();
		q.outputState = s;
		this.setState(q);
	}

	public getKeyBindings(): KeyBindingsType {
		return this.props.keyBindings;
	}

	public setKeyBindings(s: KeyBindingsType): void {
		const q = this.copyState();
		q.keyBindings = s;
		this.setState(q);
		this.editor.props.keyBindings = s;
	}

	public render() {
		return (
			<Row className="bg-dark flex d-flex justify-content-start flex-fill">
				<Col>
					{this.editor}
				</Col>
				<Col>
					{this.output}
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
