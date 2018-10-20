import * as React from 'react'
import { ITreeNode } from '../TreeView/lib'

import './styles.css'

export interface IFileTreeNodeProps {
    node: ITreeNode,
    onClick: (event: Event, node: ITreeNode) => void,
}

export default class FileTreeNode extends React.Component<IFileTreeNodeProps, any, any> {
    public render(){
        return (
            <div
                className={'FileTreeNode'}
            >
                {this.renderName()}
            </div>
        )
    }

    private renderName() {
        const node = this.props.node
        const c: any = this.props.onClick

        if (/dwg$/.test(node.id)) {
            return (
                <button
                    onClick={c}
                >
                    {node.name}
                </button>
            )
        } else {
            return (
                <span>
                    {node.name}
                </span>
            )
        }
    }
}
