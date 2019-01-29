import * as React from 'react';
import { ITreeNode } from './lib';
import TreeNode from './TreeNode';

export interface ITreeViewProps<T> {
    tree: ITreeNode<T>,
    onClick?: (event: Event, node: ITreeNode<T>) => void,
    onFoldChange: (node: ITreeNode<T>) => void,
    renderNode(
        node: ITreeNode<T>,
        onClick: (event: Event, node: ITreeNode<T>) => void,
        onFoldChange: (node: ITreeNode<T>) => void,
    ): JSX.Element,
}

export default class TreeView<T> extends React.Component<ITreeViewProps<T>, any, any> {
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
