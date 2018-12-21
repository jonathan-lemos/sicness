/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import React from "react";
import { Col, Row } from "reactstrap";
import { DsAceEditor, KeyBindingsType } from "./DsAceEditor";

export interface IDsCompilerProps {
	editorKeyBindings: KeyBindingsType;
	editorValue: string;
	outputValue: string;
}

export interface IDsCompilerState {
	editorKeyBindings: KeyBindingsType;
	editorState: string;
	outputState: string;
}

export class DsCompiler extends React.Component<IDsCompilerProps, IDsCompilerState> {
	public static defaultProps: IDsCompilerProps = {
		editorKeyBindings: null,
		editorValue: "",
		outputValue: "",
	};

	private editor: DsAceEditor | null;

	constructor(props: IDsCompilerProps) {
		super(props);
		this.state = {
			editorKeyBindings: null,
			editorState: "",
			outputState: this.props.outputValue,
		};

		this.editor = null;

		this.getEditorText = this.getEditorText.bind(this);
		this.setEditorText = this.setEditorText.bind(this);
		this.getOutputText = this.getOutputText.bind(this);
		this.setOutputText = this.setOutputText.bind(this);
		this.getEditorKeyBindings = this.getEditorKeyBindings.bind(this);
		this.setEditorKeyBindings = this.setEditorKeyBindings.bind(this);
		this.handleOutputChange = this.handleOutputChange.bind(this);
		this.copyState = this.copyState.bind(this);
	}

	public getEditorText() {
		return this.state.editorState;
	}

	public getEditorKeyBindings() {
		return this.state.editorKeyBindings;
	}

	public getOutputText() {
		return this.state.outputState;
	}

	public setEditorText(s: string): void {
		const q = this.copyState();
		q.editorState = s;
		this.setState(q);
		if (this.editor !== null) {
			this.editor.setValue(s);
		}
	}

	public setEditorKeyBindings(s: KeyBindingsType): void {
		const q = this.copyState();
		q.editorKeyBindings = s;
		this.setState(q);
		if (this.editor !== null) {
			this.editor.setKeyBindings(s);
		}
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
					<DsAceEditor
						id="editor"
						keyBindings={this.state.editorKeyBindings}
						ref={e => this.editor = e}
						value={this.state.editorState}
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

	private handleOutputChange(event: React.ChangeEvent<HTMLTextAreaElement>): void {
		this.setOutputText(event.target.value);
	}

	private copyState(): IDsCompilerState {
		return {
			editorKeyBindings: this.state.editorKeyBindings,
			editorState: this.state.editorState,
			outputState: this.state.outputState,
		};
	}
}
