import rhinoscriptsyntax as rs
import scriptcontext as sc
import Rhino
import os
import json


# создать скриншот Top/Left/Right/Front окна
def create_screenshot(view, file):
    command = '-_ViewCaptureToFile {file}'.format(file=file)

    rs.ZoomExtents(view, False)
    rs.CurrentView(view)
    rs.Command(command, False)


# сделать скриншот NamedView
def capture_named_views(view, file):
    command = '-_ViewCaptureToFile {file} _EnterEnd'.format(file=file)
    
    all_views = rs.NamedViews()
    selected_views = rs.MultiListBox(all_views)
    
    for view_name in selected_views:
        rs.RestoreNamedView(view_name)
        rs.Command(command)


def main():
    task_filename = os.path.expanduser('~/Desktop/sisu_task.json')
    files_dir = os.path.expanduser('~/Desktop/screenshots')
    
    with open(task_filename, 'r') as f:
        data = json.load(f)
    
    file_id = data['fileId']
    result_filename = os.path.join(files_dir, '{}.png'.format(file_id))

    create_screenshot('Top', result_filename)

    named_views = rs.NamedViews()
    capture_named_views(named_views[0], result_filename)


if __name__ == '__main__':
    main()
