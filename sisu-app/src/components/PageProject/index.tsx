import * as React from 'react';
import { getRequest } from 'src/api';
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

export default class PageProject extends React.Component<IProps, {}, any> {
    public state = {
        project: null,
    }

    public componentDidMount() {
        const projectId = this.props.match.params.id;
        const url = `/projects/${projectId}/info`

        getRequest(url)
            .then(res => res.json())
            .then((data: any) => {
                this.setState({
                    project: data.resource,
                })
            })
    }

    public render() {
        if (!this.state.project) {
            return null
        }

        const project: any = this.state.project
        const files: string[] = project.files;

        const tree = treeFromFlat(files)
        console.log(tree)

        return (
            <div className="PageProject">
                <Header
                    title={project.name}
                />

                <div className="tree">
                    <TreeView
                        tree={tree}
                        onClick={this.onClick}
                        onFoldChange={this.onFold}
                        renderNode={this.renderTreeNode}
                    />
                </div>
            </div>
        );
    }

    private renderTreeNode = (node: ITreeNode, onClick: (event: Event) => void) => {
        return (
            <FileTreeNode
                node={node}
                onClick={onClick}
            />
        )
    }

    private onClick = (event: Event, n: ITreeNode) => {
        console.log(n)
    }

    private onFold = (n: ITreeNode) => {
        console.log(n)
    }
}
