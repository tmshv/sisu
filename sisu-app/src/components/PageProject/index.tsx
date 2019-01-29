import * as React from 'react';
import { Route } from 'react-router-dom';
import * as api from 'src/api';
import { IProjectInfo, IProjectInfoFile } from 'src/core';
import FileTreeNode from '../FileTreeNode';
import Header from '../Header';
import PageProjectFile from '../PageProjectFile';
import TreeView from '../TreeView';
import { createFlat, ITreeNode, treeFromFlat } from '../TreeView/lib';

import './styles.css';

// const tree = node('', [
//   node('1', [
//     node('4', []),
//     node('5', []),
//     node('6', []),
//   ]),
//   node('2', [
//     node('7', []),
//     node('8', [
//       node('9', []),
//     ]),
//   ]),
//   node('3', []),
// ])

interface IProps {
    match: any,
}

interface IState {
    project: any,
    file: any,
    tree?: ITreeNode<IProjectInfoFile>,
}

export default class PageProject extends React.Component<IProps, IState, any> {
    public state = {
        file: null,
        project: null,
        tree: undefined,
    }

    public async componentDidMount() {
        const project = await api.getProjectInfo(this.projectId)

        if (project) {
            this.setProject(project)
        }
    }

    public render() {
        if (!this.state.project) {
            return null
        }

        const project: any = this.state.project
        const tree = this.state.tree!

        return (
            <div className="PageProject">
                <Header
                    title={project.name}
                />

                <div className="content">
                    <div className="tree">
                        <TreeView
                            tree={tree}
                            onFoldChange={this.onFold}
                            renderNode={this.renderTreeNode}
                        />
                    </div>

                    <main>
                        <Route
                            path={`${this.props.match.url}/file/:fileId`}
                            render={this.renderFileRoute}
                        />
                    </main>
                </div>
            </div>
        );
    }

    private renderFileRoute = (props: any) => {
        return (
            <PageProjectFile
                {...props}
                projectId={this.projectId}
            />
        )
    }

    private setProject(project: IProjectInfo) {
        // const files: string[] = project.files.map(x => x.file);
        const flat = createFlat<IProjectInfoFile>(x => x.file, project.files)
        const tree = treeFromFlat(flat)

        this.setState({
            project,
            tree,
        })
    }

    private get projectId(): string {
        return this.props.match.params.projectId;
    }

    private createFileUrl = (file: IProjectInfoFile) => `/project/${this.projectId}/file/${file.fileId}`

    private renderTreeNode = (
        node: ITreeNode<IProjectInfoFile>,
        onClick: (event: Event, node: ITreeNode<IProjectInfoFile>) => void,
        onFoldChange: (node: ITreeNode<IProjectInfoFile>) => void,
    ) => {
        const on: any = () => this.onFold(node)

        return (
            <FileTreeNode
                node={node}
                createFileLink={this.createFileUrl}
                onFoldClick={on}
            />
        )
    }

    private onFold = (n: ITreeNode<IProjectInfoFile>) => {
        console.log('Change fold')
        console.log(n)

        n.folded = !n.folded

        this.forceUpdate()
    }
}
