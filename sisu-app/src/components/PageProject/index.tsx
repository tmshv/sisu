import * as React from 'react';
import { getRequest } from 'src/api';
import FileInfo from '../FileInfo';
import FileTreeNode from '../FileTreeNode';
import Header from '../Header';
import TreeView from '../TreeView';
import { ITreeNode, treeFromFlat } from '../TreeView/lib';

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
    tree?: ITreeNode,
}

export default class PageProject extends React.Component<IProps, IState, any> {
    public state = {
        file: null,
        project: null,
        tree: undefined,
    }

    public componentDidMount() {
        const url = `/projects/${this.projectId}/info`

        getRequest(url)
            .then(res => res.json())
            .then((data: any) => {
                this.setProject(data.resource)
            })
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
                            onClick={this.onClick}
                            onFoldChange={this.onFold}
                            renderNode={this.renderTreeNode}
                        />
                    </div>

                    {!this.state.file ? null : (
                        <FileInfo
                            file={this.state.file}
                        />
                    )}
                </div>
            </div>
        );
    }

    private setProject(project: any) {
        const files: string[] = project.files;
        const tree = treeFromFlat(files)

        this.setState({
            project,
            tree,
        })
    }

    private get projectId(): string {
        return this.props.match.params.id;
    }

    private renderTreeNode = (
        node: ITreeNode,
        onClick: (event: Event, node: ITreeNode) => void,
        onFoldChange: (node: ITreeNode) => void,
    ) => {
        const on: any = () => this.onFold(node)

        return (
            <FileTreeNode
                node={node}
                onClick={onClick}
                onFoldClick={on}
            />
        )
    }

    private onClick = (event: Event, n: ITreeNode) => {
        // console.log(n)

        getRequest(`/projects/${this.projectId}/file`, {
            file: n.id,
        })
            .then(res => res.json())
            .then((data: any) => {
                const file = data.resource;

                this.setState({
                    file,
                });
            })
    }

    private onFold = (n: ITreeNode) => {
        console.log('Change fold')
        console.log(n)

        n.folded = !n.folded

        this.forceUpdate()
    }
}
