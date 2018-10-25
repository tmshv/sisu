import * as React from "react";
import DocumentTitle from "react-document-title";
import { getRequest, putRequest } from "src/api";
import CodeEditor from "src/components/CodeEditor";
import Header from "src/components/Header";

import './styles.css';

interface IProps {
    match: any,
}

interface IState {
    project: any,
    configValue: string,
}

export default class PageProjectConfig extends React.Component<IProps, IState, any> {
    public state = {
        configValue: "",
        project: null,
    }

    public componentDidMount() {
        getRequest(`/projects/${this.projectId}/info`)
            .then(res => res.json())
            .then((data: any) => {
                this.setProject(data.resource)
            })

        getRequest(`/projects/${this.projectId}/config-data`)
            .then(res => res.json())
            .then((data: any) => {
                this.setProjectConfig(data.resource)
            })
    }

    public render() {
        const project: any = this.state.project

        if (!project) {
            return null
        }

        return (
            <div className="PageProjectConfig">
                <DocumentTitle
                    title={"Config"}
                />

                <Header
                    title={project.name}
                />

                <div className="content">
                    <CodeEditor
                        value={this.state.configValue}
                        onChange={this.onConfigValueChange}
                    />

                    <button
                        onClick={this.onClickSave}
                    >
                        Save
                </button>
                </div>
            </div>
        );
    }

    private onClickSave = (event: any) => {
        const url = `/projects/${this.projectId}/config-data`

        putRequest(url, {
            data: this.state.configValue,
        })
            .then(res => res.json())
            .then((data: any) => {
                console.log(data);
                // this.setProjectConfig(data.resource)
            })
    }

    private onConfigValueChange = (newValue: string) => {
        // console.log('onChange', newValue, e);

        this.setState({
            configValue: newValue,
        })
    }

    private setProject(project: any) {
        this.setState({
            project,
        })
    }

    private setProjectConfig(configValue: any) {
        this.setState({
            configValue,
        })
    }

    private get projectId(): string {
        return this.props.match.params.id;
    }
}
