/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import React from "react";
import AceEditor from "react-ace";
import { Col, Row } from "reactstrap";
import { prototype } from "module";

export type KeyBindingsType = "" | "vim" | "emacs";

export interface IDsCompilerProps {
	editorValue: string;
	getEditorText: () => string;
	getKeyBindings: () => KeyBindingsType;
	getOutputText: () => string;
	keyBindings: KeyBindingsType;
	outputValue: string;
	setEditorText: (s: string) => void;
	setKeyBindings: (s: KeyBindingsType) => void;
	setOutputText: (s: string) => void;
}

export interface IDsCompilerState {
	editorState: string;
	keyBindings: KeyBindingsType;
	outputState: string;
}

export class DsCompiler extends React.Component<IDsCompilerProps, IDsCompilerState> {
	public static defaultProps: IDsCompilerProps = {
		editorValue: "",
		getEditorText: () => "",
		getKeyBindings: () => "",
		getOutputText: () => "",
		keyBindings: "",
		outputValue: "",
		setEditorText: (s: string) => {/** */},
		setKeyBindings: (s: string) => {/** */},
		setOutputText: (s: string) => {/** */},
	};

	private editor: JSX.Element;
	private output: JSX.Element;

	constructor(props: IDsCompilerProps) {
		props.getEditorText = () => {
			return this.state.editorState;
		};

		props.getKeyBindings = () => {
			return this.state.keyBindings;
		};

		props.getOutputText = () => {
			return this.state.outputState;
		};

		props.setEditorText = (s: string): void => {
			const q = this.copyState();
			q.editorState = s;
			this.setState(q);
		};

		props.setKeyBindings = (s: KeyBindingsType): void => {
			const q = this.copyState();
			q.keyBindings = s;
			this.setState(q);
			this.editor.props.keyBindings = s;
		};

		props.setOutputText = (s: string) => {
			const q = this.copyState();
			q.outputState = s;
			this.setState(q);
		};

		super(props);
		this.state = {
			editorState: this.props.editorValue,
			keyBindings: this.props.keyBindings,
			outputState: this.props.outputValue,
		};

		this.props.getEditorText = this.props.getEditorText.bind(this);
		this.props.setEditorText = this.props.setEditorText.bind(this);
		this.props.getOutputText = this.props.getOutputText.bind(this);
		this.props.setOutputText = this.props.setOutputText.bind(this);
		this.props.getKeyBindings = this.props.getKeyBindings.bind(this);
		this.props.setKeyBindings = this.props.setKeyBindings.bind(this);
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
		this.props.setEditorText(value);
	}

	private handleOutputChange(event: React.ChangeEvent<HTMLTextAreaElement>): void {
		this.props.setOutputText(event.target.value);
	}

	private copyState(): IDsCompilerState {
		return {
			editorState: this.state.editorState,
			keyBindings: this.state.keyBindings,
			outputState: this.state.outputState,
		};
	}
}
