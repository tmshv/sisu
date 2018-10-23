import { FolderIcon, FolderOpenIcon } from 'mdi-react'
import * as React from 'react'
import { ITreeNode } from '../TreeView/lib'

import './styles.css'

export interface IFileTreeNodeProps {
    node: ITreeNode,
    onClick: (event: Event, node: ITreeNode) => void,
    onFoldClick: (event: Event) => void,
}

export default class FileTreeNode extends React.Component<IFileTreeNodeProps, any, any> {
    public render() {
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
        const f: any = this.props.onFoldClick

        if (/dwg$/.test(node.id)) {
            return (
                <button
                    onClick={c}
                >
                    {node.name}
                </button>
            )
        } else {
            const Icon = node.folded
                ? FolderIcon
                : FolderOpenIcon

            return (
                <div className={'folder'}>
                    <Icon
                        color={'#ccc'}
                        size={15}
                    />

                    <button
                        onClick={f}
                    >
                        {node.name}
                    </button>
                </div>
            )
        }
    }
}
