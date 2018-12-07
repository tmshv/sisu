# Sisu

## Models

### ProjectFile

```js
{
    file: "/path/to/file.dwg",
    type: "application/acad",
    hash: sha256(file),
}
```

## API

### Update project state

Update project file structure.

```js
{
    projectFiles: ProjectFile[],
    lastScanTs: Number,
    workerAppVersion: String,
}
```

## Q Messages

### FILE_TREE.UPDATE

Load latest file tree structure. Save in data base with `/api/v1/projects/<project_id>/update-state`

```js
{
    action: "FILE_TREE.UPDATE",
    payload: {
        mask: "/path/to/**/dwg/files/*.dwg"
    },
}
```