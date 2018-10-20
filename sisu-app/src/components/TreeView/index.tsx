import * as React from 'react';
import { ITreeNode } from './lib';
import TreeNode from './TreeNode';

export interface ITreeViewProps {
    tree: ITreeNode,
    onClick: (event: Event, node: ITreeNode) => void,
    onFoldChange: (node: ITreeNode) => void,
    renderNode(node: ITreeNode, onClick: (event: Event) => void): JSX.Element,
}

export default class TreeView extends React.Component<ITreeViewProps, any, any> {
    public render() {
        return (
            <div className="TreeView">
                <TreeNode
                    mix={'root'}
                    node={this.props.tree}
                    onClick={this.props.onClick}
                    onFoldChange={this.props.onFoldChange}
                    renderNode={this.props.renderNode}
                />
            </div>
        );
    }
}
