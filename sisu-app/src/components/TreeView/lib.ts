import FlatToNested from 'flat-to-nested'
import {uniqBy} from 'lodash'

export interface ITreeNode {
    folded: boolean,
    id: string,
    name: string,
    nodes: ITreeNode[],
}

const id = () => `${Math.floor(Math.random() * 1000)}`

export function node(name: string, nodes: ITreeNode[]): ITreeNode {
    return {
        folded: false,
        id: id(),
        name,
        nodes,
    }
}

export function treeFromFlat(files: string[]): ITreeNode {
    const flat = createFlat(files)
    const nest = new FlatToNested({
        children: 'nodes',
        id: 'id',
        parent: 'parent',
    });

    return nest.convert(flat);
}

function createFlat(files: string[]): object[] {
    // [
    //     {id: 111, parent: 11},
    //     {id: 11, parent: 1},
    //     {id: 12, parent: 1},
    //     {id: 1}
    // ];

    const createId = (items: string[]): string => {
        return items.reverse().join('/')
    }

    const flat = flatArray(
        files.map(file => splitFilepath(file)
            .reverse()
            .map((part, i, parts) => ({
                folded: false,
                id: createId(parts.slice(i)),
                name: part,
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
            }, []))
    )

    return uniqBy(flat, x => x.id)
}

function splitFilepath(filepath: string): string[] {
    const parts = flatArray(filepath
        .replace(/\\/g, '/')
        .split(/^(\w:)/)
        .map(x => x.split('/'))
    )

    return parts.filter(x => x !== '')
}

function flatArray<T>(items: T[][]): T[] {
    return items.reduce((acc, x) => [...acc, ...x], [])
}
