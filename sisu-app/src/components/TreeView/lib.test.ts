import { createFlat, createId, splitFilepath } from "./lib";

describe('splitFilepath', () => {
    test('should split file path to parts', () => {
        const x = splitFilepath('/some/one/file')
        expect(x).toEqual(['some', 'one', 'file'])
    })

    test('should split windows file path', () => {
        const x = splitFilepath('C:\\Program Files\\Filepath Splitter')
        expect(x).toEqual(['C:', 'Program Files', 'Filepath Splitter'])
    })
})

describe('createId', () => {
    test('should create id', () => {
        const x = createId(['file', 'one', 'some'])
        expect(x).toEqual('some/one/file')
    })
})

describe('createFlat', () => {
    test('should create right file structure', () => {
        const sample = [
            '/some/one/folder',
            '/some/two/file',
            '/some/two/folder/file',
            '/some/three/path',
        ]
        const selector = (file: string) => file
        const flat = createFlat(selector, sample)

        expect(flat).toMatchObject([
            {
                id: 'some/one/folder',
                name: 'folder',
                parent: 'some/one',
            },
            {
                id: 'some/one',
                name: 'one',
                parent: 'some',
            },
            {
                id: 'some',
                name: 'some',
                parent: null,
            },
            {
                id: 'some/two/file',
                name: 'file',
                parent: 'some/two',
            },
            {
                id: 'some/two',
                name: 'two',
                parent: 'some',
            },
            {
                id: 'some/two/folder/file',
                name: 'file',
                parent: 'some/two/folder',
            },
            {
                id: 'some/two/folder',
                name: 'folder',
                parent: 'some/two',
            },
            {
                id: 'some/three/path',
                name: 'path',
                parent: 'some/three',
            },
            {
                id: 'some/three',
                name: 'three',
                parent: 'some',
            },
        ])
    })

    test('should assign input item to leaf items as payload', () => {
        const sample = [
            '/some/one/file',
            '/some/two/file',
        ]
        const selector = (file: string) => file
        const flat = createFlat(selector, sample)

        expect(flat).toMatchObject([
            {
                id: 'some/one/file',
                payload: '/some/one/file',
            },
            {
                id: 'some/one',
                payload: null,
            },
            {
                id: 'some',
                payload: null,
            },
            {
                id: 'some/two/file',
                payload: '/some/two/file',
            },
            {
                id: 'some/two',
                payload: null,
            },
        ])
    })
})