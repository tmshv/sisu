import * as React from "react"
import SimpleEditor from "react-simple-code-editor"

import { highlight, languages } from "prismjs";

// import "prismjs/components/prism-clike";
// import "prismjs/components/prism-javascript";

interface IProps {
    value: string,
    onChange(value: string): void,
}

const style = {
    fontFamily: '"Fira code", "Fira Mono", monospace',
    fontSize: 12,
};

export default class CodeEditor extends React.Component<IProps, {}, any> {
    public render() {
        return (
            <SimpleEditor
                value={this.props.value}
                onValueChange={this.props.onChange}
                highlight={this.highlight}
                padding={10}
                style={style}
                tabSize={4}
                insertSpaces={true}
            />
        )
    }

    private highlight = (value: string) => {
        const v = highlight(value, languages.js)

        console.log(v)
        return v;
    }
}
