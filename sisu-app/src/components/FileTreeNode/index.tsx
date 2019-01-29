import className from 'classnames'
import { FolderIcon, FolderOpenIcon } from 'mdi-react'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { IProjectInfoFile } from 'src/core'
import { ITreeNode } from '../TreeView/lib'

import './styles.css'

export interface IFileTreeNodeProps<T> {
    node: ITreeNode<T>,
    onFoldClick: (event: Event) => void,
    createFileLink(file: T): string,
}

export default class FileTreeNode extends React.Component<IFileTreeNodeProps<IProjectInfoFile>, any, any> {
    public render() {
        const file = this.props.node.payload;
        const status = file
            ? file.buildStatus
            : null;

        return (
            <div
                className={'FileTreeNode'}
            >
                {this.renderName()}

                {!status ? null : (
                    <div className={className('file-info', `status-${status}`)}>
                        {status}
                    </div>
                )}
            </div>
        )
    }

    private renderFile() {
        const node = this.props.node
        const href = this.props.createFileLink(node.payload)

        return (
            <Link
                to={href}
            >
                {node.name}
            </Link>
        )
    }

    private renderName() {
        const node = this.props.node
        const f: any = this.props.onFoldClick

        if (/dwg$/.test(node.id)) {
            return this.renderFile()
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
