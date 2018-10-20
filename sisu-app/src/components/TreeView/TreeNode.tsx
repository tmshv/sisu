import className from 'classnames';
import * as React from 'react';
import { ITreeNode } from './lib';

import './TreeNode.css'

export interface ITreeNodeProps {
    node: ITreeNode,
    mix?: string,
    onFoldChange: (node: ITreeNode) => void,
    onClick: (event: Event, node: ITreeNode) => void,
    renderNode(node: ITreeNode, onClick: (event: Event) => void): JSX.Element, 
}

export default class TreeNode extends React.Component<ITreeNodeProps, any, any> {
    private get hasChildren(): boolean {
        const { node } = this.props

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
                {!this.hasChildren ? null : (
                    this.renderNodes()
                )}
            </div>
        )
    }

    private onClick = (event: Event) => this.props.onClick(event, this.props.node)

    private renderNode() {
        return this.props.renderNode(this.props.node, this.onClick)
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
