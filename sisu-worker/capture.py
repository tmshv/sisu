import rhinoscriptsyntax as rs
import scriptcontext as sc
import Rhino
import os
import json
from rhino import script_start, script_end, open_file, get_config, save_result


class Capture:
    def __init__(self, base_command):
        self.base_command = base_command
        self.zoom_extents = True

    def get_command(self, file):
        return '-_{cmd} {file}'.format(cmd=self.base_command, file=file)

    def create_capture(self, view, file):
        command = self.get_command(file)

        if self.zoom_extents:
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
    config = get_config()

    file_id = config['fileId']
    files_dir = config['outputDir']
    items = config['previews']
    filename = config['filename']
    capture_command = config.get('captureRhinoCommand', 'ViewCaptureToFile')
    
    script_start()
    
    s = open_file(filename)

    # if not s:
    # task_result = get_task_error('cannot open file {}'.format(filename))
    # save_task_result(task_result)
    # return

    c = Capture(capture_command)
    result = {
        'previews': [],
    }

    i = 0
    for capture in items:
        filename = '{file_id}-{index}.png'.format(file_id=file_id, index=i)
        result_filename = os.path.join(files_dir, filename)
        viewport = capture['viewport']

        c.create_capture(viewport, result_filename)

        result['previews'].append(result_filename)

        # named_views = rs.NamedViews()
        # capture_named_views(named_views[0], result_filename)
        i += 1

    save_result(result)
    script_end()


if __name__ == '__main__':
    main()
