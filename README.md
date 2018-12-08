# Sisu

## Test list

1. layerExist         test if Layer is exist
2. emptyLayer         test if Layer is empty
3. geometryClosed     test if geometry on layer is closed
4. isCurvePlanar      test if geometry on layer is planar
5. layerConsistency   test curve objects on specific layers
6. layerConsistency   test block objects on specific layers
7. blockNameRelation  test relation between block name and layer name where block exists

## Links

- [TestRhino6Automation](https://github.com/mcneel/rhino-developer-samples/blob/6/rhinoscript/TestRhino6Automation.vbs)

## Models

### ProjectFile

```js
{
    file: "/path/to/file.dwg",
    type: "application/acad",
    hash: sha256(file),
}
```

### SisuTest

```js
{
    type: "",
}
```

## API v1

### Update project state

Update project file structure.

```
POST /api/v1/projects/<project_id>/update-state
```

```js
{
    files: ProjectFile[],
    lastScanTs: Number,
    workerAppVersion: String,
}
```

### Get project input

Get project input file masks.

```
GET /api/v1/projects/<project_id>/config/input
```

```js
[String] // "/path/to/**/dwg/files/*.dwg"
```

## Q Messages v1

### FILE_TREE.UPDATE

Load latest file tree structure

Request:
```js
{
    action: "FILE_TREE.UPDATE",
    payload: {
        mask: string | string[] // "/path/to/**/dwg/files/*.dwg",
    },
}
```

Response:
```js
{
    payload: [
        {
            file: "/path/to/file.dwg",
            type: 'application/acad',
            hash: sha256(file),
        },
    ],
}
```

### FILE.TEST

Test file. Save result with with `/api/v1/projects/<>/file`

Request:

```js
{
    action: "FILE.TEST",
    payload: {
        file: "/path/to/file.dwg",
        tests: SisuTest[],
    },
}
```

Response:

```js
null
```

### FILE.UPDATE_PREVIEW

Make screenshot of dwg model. Upload with `/api/v1/upload`

```js
{
    action: "FILE.UPDATE_PREVIEW",
    payload: {
        file: "/path/to/file.dwg",
        resolution: [1920, 1080],
    },
}
```