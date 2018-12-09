/*
 * Copyright (c) 2018 Jonathan Lemos
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import React from "react";
import AceEditor from "react-ace";
import { Col, Row } from "reactstrap";

export interface IDsCompilerProps {
	keyboardHandler: "" | "vim" | "emacs";
}

export class DsCompiler extends React.Component<IDsCompilerProps> {
	public static defaultProps: IDsCompilerProps = {
		keyboardHandler: "",
	};

	public render() {
		const q = <AceEditor/>;
		return (
			<Row
				className="bg-dark flex d-flex justify-content-start flex-fill"
				>
				<Col>
					<AceEditor
						mode="sicxe"
						theme="monokai"
						// onChange={onChange}
						name="editor"
						// editorProps={{$blockScrolling: true}}
						keyboardHandler={this.props.keyboardHandler}
						/>
				</Col>
				<Col>
					<textarea
						id="output"
						placeholder="Output goes here"
						readOnly={true}
						wrap="soft"
						className="form-control bg-dark text-light"
						/>
				</Col>
			</Row>
		);
	}
}
