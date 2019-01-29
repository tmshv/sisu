import FlatToNested from 'flat-to-nested'
import { uniqBy } from 'lodash'

export interface ITreeNode<T> {
    folded: boolean,
    payload: T,
    id: string,
    name: string,
    nodes: Array<ITreeNode<T>>,
}

interface INodeItem<T> {
    id: string,
    parent: string | null,
    name: string,
    payload: T | null,
}

// const id = () => `${Math.floor(Math.random() * 1000)}`

// export function node(name: string, nodes: ITreeNode[]): ITreeNode {
//     return {
//         folded: false,
//         id: id(),
//         name,
//         nodes,
//     }
// }

export function createId (parts: string[]): string {
    return parts.reverse().join('/')
}

export function treeFromFlat<T>(files: Array<INodeItem<T>>): ITreeNode<T> {
    const flat = files
        .map(x => ({
            ...x,
            folded: false,
        }))
    const nest = new FlatToNested({
        children: 'nodes',
        id: 'id',
        parent: 'parent',
    });

    return nest.convert(flat);
}

export function createFlat<T>(selector: (item: T) => string, items: T[]): Array<INodeItem<T>> {
    const selectedItems = items.reduce((acc, item) => {
        const file = selector(item)
        const fileId = createId(splitFilepath(file).reverse())
        acc.set(fileId, item)

        return acc
    }, new Map())

    const flat: Array<INodeItem<T>> = flatArray(items.map(item => {
        const file = selector(item)

        return splitFilepath(file)
            .reverse()
            .map((part, i, parts) => ({
                id: createId(parts.slice(i)),
                name: part,
                payload: null,
            }))
            .reduce((acc, part, index, list) => {
                const parent = index < list.length - 1
                    ? list[index + 1].id
                    : null
                const x = {
                    ...part,
                    parent,
                }
                return [...acc, x]
            }, [])
    }))

    for (const item of flat) {
        if (selectedItems.has(item.id)) {
            item.payload = selectedItems.get(item.id)
        }
    }

    return uniqBy(flat, x => x.id)
}

export function splitFilepath(filepath: string): string[] {
    const parts = flatArray(filepath
        .replace(/\\/g, '/')
        .split(/^(\w:)/)
        .map(x => x.split('/')),
    )

    return parts.filter(x => x !== '')
}

function flatArray<T>(items: T[][]): T[] {
    return items.reduce((acc, x) => [...acc, ...x], [])
}
