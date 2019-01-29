import * as React from 'react';
import * as api from 'src/api';
import { IFile } from 'src/core';
import FileInfo from '../FileInfo';

import './styles.css';

interface IProps {
    match: any,
    projectId: string,
}

interface IState {
    file: IFile | null,
}

export default class PageProject extends React.Component<IProps, IState, any> {
    public state = {
        file: null,
    }

    private get projectId(): string {
        // return this.props.match.params.projectId;
        return this.props.projectId;
    }

    private get fileId(): string {
        return this.props.match.params.fileId;
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.update()
    }

    public componentDidMount() {
        console.log('match', this.props.match)

        this.update()
    }

    public render() {
        return (
            <div className="PageProjectFile">
                {!this.state.file ? null : (
                    <FileInfo
                        file={this.state.file!}
                    />
                )}
            </div>
        );
    }

    private update() {
        api.getProjectFile(this.projectId, this.fileId)
            .then(file => {
                this.setState({
                    file,
                });
            })
    }
}
