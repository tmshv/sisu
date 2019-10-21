# Sisu

// dp

Create data provider 
POST /dp/

Get current files metadata
GET  /dp/<dp_id>/files/metadata

Get changed files metadata
GET  /dp/<dp_id>/files/metadata?since=<timestamp>

GET  /dp/<dp_id>/files/<file_id>/metadata
GET  /dp/<dp_id>/files/<file_id>/content


// todo:
 - api: get all changed files related to task_input
 - api: /api/v1/data/id/files mask=*.dwg 

// Task
 - Update Data Provider
 - Run: tests -> gh -> print
 - Run: tests -> exel

// Loop
 - get all projects
 - for each project
 - get tasks
 - run each task

// Task: update tree
input: dp_id + mask
output: file[]

// Task: tests + exel
input: dp_id + mask
output: tests, exel_artifact

// Task: tests + gh + print
input: dp_id + mask
output: tests, 3dm_artifact, pdf_artifact

file
    - filename
    - hash
    - tests
    - exel
    - 3dm
    - pdf

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
- [Rhino3dm JavaScript Sample](https://github.com/mcneel/rhino3dm/blob/master/samples/javascript)

## Models

### DataProvider

```js
{
    type: "Local",
    name: "MLA+ Server",
    id: ObjectId,
    prefix: "",
    // authToken: "",
}
```

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
    name: String,
    mask?: String,
    layer?: String,
    ignore?: String[],
    types?: String[],
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

Test file with test suite.

Request:

```js
{
    action: "FILE.TEST",
    payload: {
        fileId: "<file_id>",
        tests: SisuTest[],
    },
}
```

Response:

```js
[
    {
        ok: boolean,
        result: any,
        test: any,
    },
]
```

### FILE.PREVIEW

Make screenshot of 3dm/dwg model.

```js
{
    action: "FILE.PREVIEW",
    payload: {
        fileId: "<file_id>",
        previews: [
            {
                viewport: "Top",
                size: [1920, 1080],
            },
        ],
    },
}
```


## Related projects

### [nexrender](https://github.com/inlife/nexrender)
### [HydraShare](https://github.com/HydraShare/hydra/wiki)

Data driven automation for After Effects
