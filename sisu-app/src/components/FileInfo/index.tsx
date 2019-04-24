import { basename } from 'path';
import * as React from 'react';
import { IFile } from 'src/core';

import FilePreview from '../FilePreview';
import './styles.css';

interface IProps {
    file: IFile,
}

interface IState {
    onlyFailed: boolean,
}

export default class FileInfo extends React.Component<IProps, IState> {
    public state = {
        onlyFailed: false,
    }

    public render() {
        const file = this.props.file;
        const fileTests = file.tests || [];
        const name = basename(file.filename);
        const preview: any = (file as any).preview;

        return (
            <div className="FileInfo">
                <h1>{name}</h1>

                {!preview ? null : (
                    <FilePreview
                        items={preview}
                    />
                )}

                {!fileTests.length ? null : (
                    this.rednerTestsBlock()
                )}
            </div>
        );
    }

    private rednerTestsBlock = () => {
        const file = this.props.file;
        const fileTests = file.tests || [];
        const tests = this.state.onlyFailed
            ? fileTests.filter(x => x.status === "fail")
            : fileTests

        return (
            <>
                <h2>Tests</h2>

                <label>
                    <input
                        type="checkbox"
                        checked={this.state.onlyFailed}
                        onChange={this.onChangeOnlyFaieled}
                    />
                    only failed
                </label>

                <div className="TestList">
                    {tests.map((x, i) => (
                        <div
                            key={i}
                            className="TestItem"
                        >
                            <div>
                                {x.name}
                                {x.options.layer
                                    ? (` (Layer: ${x.options.layer})`)
                                    : (` (Mask: ${x.options.mask})`)
                                }
                            </div>
                            <div>
                                {x.status}
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    }

    private onChangeOnlyFaieled = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            onlyFailed: event.target.checked,
        })
    }
}
