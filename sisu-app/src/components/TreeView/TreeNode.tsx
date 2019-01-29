import className from 'classnames';
import { isFunction } from 'lodash';
import * as React from 'react';
import { ITreeNode } from './lib';

import './TreeNode.css'

export interface ITreeNodeProps<T> {
    node: ITreeNode<T>,
    mix?: string,
    onFoldChange: (node: ITreeNode<T>) => void,
    onClick?: (event: Event, node: ITreeNode<T>) => void,
    renderNode(
        node: ITreeNode<T>,
        onClick: (event: Event, node: ITreeNode<T>) => void,
        onFoldChange: (node: ITreeNode<T>) => void,
    ): JSX.Element,
}

export default class TreeNode<T> extends React.Component<ITreeNodeProps<T>, any, any> {
    private get hasContent(): boolean {
        const { node } = this.props

        if (node.folded) {
            return false
        }

        if (!node.nodes) {
            return false
        }

        return node.nodes.length > 0
    }

    public render() {
        const { node } = this.props

        return (
            <div className={className('TreeNode', this.props.mix)}>
                {!node.name ? null : (
                    this.renderNode()
                )}
                {!this.hasContent ? null : (
                    this.renderNodes()
                )}
            </div>
        )
    }

    private onClick = (event: Event) => {
        if (isFunction(this.props.onClick)) {
            this.props.onClick!(event, this.props.node)
        }
    }

    private renderNode() {
        return this.props.renderNode(this.props.node, this.onClick, this.props.onFoldChange)
    }

    private renderNodes() {
        return (
            <div className={'nodes'}>
                {this.props.node.nodes.map(node => (
                    <TreeNode
                        key={node.id}
                        node={node}
                        onClick={this.props.onClick}
                        onFoldChange={this.props.onFoldChange}
                        renderNode={this.props.renderNode}
                    />
                ))}
            </div>
        )
    }
}
