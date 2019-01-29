import { FolderIcon, FolderOpenIcon, LinkVariantIcon } from 'mdi-react'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { IProjectInfoFile } from 'src/core'
import IconButton from '../IconButton'
import { ITreeNode } from '../TreeView/lib'

import './styles.css'

const copyToClipboard = (str: string) => {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

export interface IFileTreeNodeProps<T> {
    node: ITreeNode<T>,
    onFoldClick: (event: Event) => void,
    createFileLink(file: T): string,
}

export default class FileTreeNode extends React.Component<IFileTreeNodeProps<IProjectInfoFile>> {
    public render() {
        const showActions = this.isFile

        return (
            <div
                className={'FileTreeNode'}
            >
                {this.renderName()}

                {!showActions ? null : (
                    <div className={'actions'}>
                        <IconButton
                            disabled={true}
                            size={15}
                            onClick={this.onClickCopyLink}
                        >
                            <LinkVariantIcon />
                        </IconButton>
                    </div>
                )}
            </div>
        )
    }

    private get isFile() {
        const node = this.props.node

        return /dwg$/.test(node.id)
    }

    private onClickCopyLink = (event: React.MouseEvent<HTMLButtonElement>) => {
        const node = this.props.node
        const href = this.props.createFileLink(node.payload)

        copyToClipboard(href)
    }

    private renderFile() {
        const file = this.props.node.payload;
        const status = file
            ? file.buildStatus
            : null;

        const node = this.props.node
        const href = this.props.createFileLink(node.payload)

        return (
            <Link
                to={href}
                className={`status-${status}`}
            >
                {node.name}
            </Link>
        )
    }

    private renderName() {
        const node = this.props.node
        const f: any = this.props.onFoldClick

        if (this.isFile) {
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
