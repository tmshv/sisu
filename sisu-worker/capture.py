import rhinoscriptsyntax as rs
import scriptcontext as sc
import Rhino
import os
import json


def open_file(path):
    rs.DocumentModified(False)
    return rs.Command('_-Open "{}" _Enter'.format(path))


def create_screenshot(view, file):
    command = '-_ViewCaptureToFile {file}'.format(file=file)

    rs.ZoomExtents(view, False)
    rs.CurrentView(view)
    rs.Command(command, False)


def capture_named_views(view, file):
    command = '-_ViewCaptureToFile {file} _EnterEnd'.format(file=file)

    all_views = rs.NamedViews()
    selected_views = rs.MultiListBox(all_views)

    for view_name in selected_views:
        rs.RestoreNamedView(view_name)
        rs.Command(command)


def main():
    task_filename = os.path.expanduser('~/Desktop/sisu_task.json')

    with open(task_filename, 'r') as f:
        data = json.load(f)

    file_id = data['fileId']
    files_dir = data['outputDir']
    items = data['previews']

    filename = data['filename']
    s = open_file(filename)

    # if not s:
    # task_result = get_task_error('cannot open file {}'.format(filename))
    # save_task_result(task_result)
    # return

    i = 0
    for capture in items:
        filename = '{file_id}-{index}.png'.format(file_id=file_id, index=i)
        result_filename = os.path.join(files_dir, filename)
        viewport = capture['viewport']

        create_screenshot(viewport, result_filename)

        # named_views = rs.NamedViews()
        # capture_named_views(named_views[0], result_filename)
        i += 1

    rs.DocumentModified(False)
    rs.Exit()


if __name__ == '__main__':
    main()
