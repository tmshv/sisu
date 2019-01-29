import { basename } from 'path';
import * as React from 'react';
import { IFile } from 'src/core';

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
        const name = basename(file.filename);
        const tests = this.state.onlyFailed
            ? file.tests.filter(x => x.status === "fail")
            : file.tests

        console.log(file)

        return (
            <div className="FileInfo">
                <h1>{name}</h1>

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
            </div>
        );
    }

    private onChangeOnlyFaieled = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            onlyFailed: event.target.checked,
        })
    }
}
